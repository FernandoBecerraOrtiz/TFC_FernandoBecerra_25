<?php

header('Content-Type: application/json; charset=UTF-8');
session_start();
require_once __DIR__ . '/db.php';

function out($arr, $code = 200) {
  http_response_code($code);
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

if (function_exists('getConnection')) {
  $conn = getConnection();
}

if (!isset($conn) || !$conn) {
  out(['ok' => false, 'error' => 'DB no disponible (mysqli)'], 500);
}

$me = $_SESSION['me'] ?? $_SESSION['usuario'] ?? null;
$tipo = $me['tipo'] ?? '';
$uid = intval($me['id'] ?? $me['ID'] ?? 0);

if (!$me || !in_array($tipo, ['profesor', 'admin'])) {
  out(['ok' => false, 'error' => 'No autorizado'], 403);
}

function looks_like_hash($s) {
  if (!is_string($s) || $s == '') {
    return false;
  }

  if (strpos($s, '$2y$') == 0 || strpos($s, '$2a$') == 0) {
    return true; // bcrypt
  }
  
  if (strpos($s, '$argon2') == 0) {
    return true; // argon2
  }

  $info = password_get_info($s);
  if ($info) {
      if (isset($info['algo'])) {
          if ($info['algo'] != 0) {
              return true;
          }
      }
  }

  return false;
}

// RUTA: GET -> listar alumnos (admin / profesor)
if ($_SERVER['REQUEST_METHOD'] == 'GET') {

  // Comprobar si existe tabla inscripciones
  $hasIns = $conn->query("SHOW TABLES LIKE 'inscripciones'");
  $hayIns = $hasIns && $hasIns->num_rows > 0;

  if ($tipo == 'admin') {
    // Admin ve todos los estudiantes
    $stmt = $conn->prepare("SELECT id, nombre, email, fecha_registro, tipo FROM usuarios ORDER BY id DESC");
  } elseif ($hayIns) {
    // Profesor sólo ve sus alumnos (inscritos en sus cursos)
    $sql = "SELECT DISTINCT u.id, u.nombre, u.email, u.fecha_registro, u.tipo
                FROM usuarios u
                JOIN inscripciones i ON i.usuario_id = u.id
                JOIN cursos c       ON c.id = i.curso_id
                WHERE u.tipo = 'estudiante'
                  AND c.profesor_id = ?
                ORDER BY u.id DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $uid);
  } else {
    // Fallback si no existe tabla inscripciones
    $stmt = $conn->prepare("SELECT id, nombre, email, fecha_registro, tipo FROM usuarios ORDER BY id DESC");
  }

  if (!$stmt || !$stmt->execute()) {
    out(['ok' => false, 'error' => 'No se pudieron listar alumnos'], 500);
  }

  $res = $stmt->get_result();
  $outAlumnos = [];

  while ($r = $res->fetch_assoc()) {
    $r['id'] = (int)$r['id'];
    $outAlumnos[] = $r;
  }

  $stmt->close();
  out(['ok' => true, 'alumnos' => $outAlumnos]);
}

// RUTA: POST -> CRUD de usuarios (SOLO ADMIN)
if ($_SERVER['REQUEST_METHOD'] == 'POST') {

  if ($tipo != 'admin') {
    out(['ok' => false, 'error' => 'Solo un administrador puede modificar usuarios'], 403);
  }

  $accion = $_POST['accion'] ?? '';

  // Normalizar tipo permitido
  $tipoPermitido = function ($t) {
    $t = strtolower(trim($t));
    if (!in_array($t, ['estudiante', 'profesor', 'admin'])) {
      $t = 'estudiante';
    }
    return $t;
  };

  // Crear usuario
  if ($accion == 'crear') {
    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $tipoUser = $tipoPermitido($_POST['tipo'] ?? 'estudiante');

    if ($nombre == '' || $email == '' || $password == '') {
      out(['ok' => false, 'error' => 'Nombre, email y contraseña son obligatorios'], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      out(['ok' => false, 'error' => 'Email inválido'], 400);
    }

    // Al crear un usuario, siempre hasheamos la contraseña que viene del formulario
    $hash = password_hash($password, PASSWORD_DEFAULT);
    if ($hash == false) {
      out(['ok' => false, 'error' => 'No se pudo hashear la contraseña'], 500);
    }

    $stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, password, tipo, foto_perfil) VALUES (?, ?, ?, ?, 'person.svg')");
    if (!$stmt) {
      out(['ok' => false, 'error' => 'Error en la preparación de la consulta: ' . $conn->error], 500);
    }

    $stmt->bind_param('ssss', $nombre, $email, $hash, $tipoUser);
    if (!$stmt->execute()) {
      $err = $conn->errno == 1062 ? 'Ya existe un usuario con ese email' : 'No se pudo crear el usuario';
      $stmt->close();
      out(['ok' => false, 'error' => $err], 500);
    }

    $newId = (int)$stmt->insert_id;
    $stmt->close();
    out(['ok' => true, 'id' => $newId]);
  }

  // Actualizar usuario
  if ($accion == 'actualizar') {
    $id = intval($_POST['id'] ?? 0);
    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $tipoUser = $tipoPermitido($_POST['tipo'] ?? 'estudiante');

    if ($id <= 0) {
      out(['ok' => false, 'error' => 'ID de usuario inválido'], 400);
    }

    if ($nombre == '' || $email == '') {
      out(['ok' => false, 'error' => 'Nombre y email son obligatorios'], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      out(['ok' => false, 'error' => 'Email inválido'], 400);
    }

    // No permitir que el admin se borre su tipo (pero sí puede cambiarse él mismo de tipo si quiere).
    $sql = '';
    $params = [];
    $types = '';

    if ($password != '') {
      // Actualizar también la contraseña
      if (looks_like_hash($password)) {
        $hash = $password;
      } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        if ($hash == false) {
          out(['ok' => false, 'error' => 'No se pudo hashear la contraseña'], 500);
        }
      }

      $sql = "UPDATE usuarios SET nombre = ?, email = ?, tipo = ?, password = ? WHERE id = ?";
      $types = 'ssssi';
      $params = [$nombre, $email, $tipoUser, $hash, $id];
    } else {
      // Sin cambiar contraseña
      $sql = "UPDATE usuarios SET nombre = ?, email = ?, tipo = ? WHERE id = ?";
      $types = 'sssi';
      $params = [$nombre, $email, $tipoUser, $id];
    }

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
      out(['ok' => false, 'error' => 'Error en la preparación de la consulta: ' . $conn->error], 500);
    }

    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) {
      $err = $conn->errno == 1062 ? 'Ya existe un usuario con ese email' : 'No se pudo actualizar el usuario';
      $stmt->close();
      out(['ok' => false, 'error' => $err], 500);
    }

    $stmt->close();
    out(['ok' => true, 'id' => $id]);
  }

  // ELIMINAR USUARIO
  if ($accion == 'eliminar') {
    $id = intval($_POST['id'] ?? 0);

    if ($id <= 0) {
      out(['ok' => false, 'error' => 'ID de usuario inválido'], 400);
    }

    // Evitar que el admin se elimine a sí mismo
    if ($id == $uid) {
      out(['ok' => false, 'error' => 'No puedes eliminar tu propio usuario'], 400);
    }

    $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
    if (!$stmt) {
      out(['ok' => false, 'error' => 'Error en la preparación de la consulta: ' . $conn->error], 500);
    }

    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
      $stmt->close();
      out(['ok' => false, 'error' => 'No se pudo eliminar el usuario'], 500);
    }

    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected <= 0) {
      out(['ok' => false, 'error' => 'Usuario no encontrado'], 404);
    }

    out(['ok' => true, 'id' => $id]);
  }

  // Acción no reconocida
  out(['ok' => false, 'error' => 'Acción no válida'], 400);
}

// Cualquier otro método (PUT, DELETE, etc.)
out(['ok' => false, 'error' => 'Método no permitido'], 405);
