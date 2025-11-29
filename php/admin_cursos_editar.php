<?php

header('Content-Type: application/json; charset=UTF-8');
session_start();

require_once __DIR__ . '/db.php';
$conn = getConnection();
if (!$conn) {
  echo json_encode(['ok' => false, 'error' => 'DB no disponible (mysqli)']);
  exit;
}

// Autorización
$me = $_SESSION['me'] ?? null;
if (!$me || !in_array($me['tipo'], ['admin', 'profesor'])) {
  echo json_encode(['ok' => false, 'error' => 'No autorizado']);
  exit;
}
$uid  = (int)$me['id'];
$tipo = (string)$me['tipo'];

// Listar
if (isset($_GET['listar']) || (($_GET['action'] ?? '') == 'list')) {

  if ($tipo == 'profesor') {
    $stmt = $conn->prepare("SELECT id,titulo,descripcion,precio,duracion,nivel,imagen_portada,profesor_id FROM cursos WHERE profesor_id=? ORDER BY id DESC");
    $stmt->bind_param("i", $uid);
  } else {
    $stmt = $conn->prepare("SELECT id,titulo,descripcion,precio,duracion,nivel,imagen_portada,profesor_id FROM cursos ORDER BY id DESC");
  }

  $stmt->execute();
  $res = $stmt->get_result();

  $cursos = [];
  $ids = [];

  while ($row = $res->fetch_assoc()) {
    $row['precio'] = (float)$row['precio'];
    $row['duracion'] = (int)$row['duracion'];
    $cursos[] = $row;
    $ids[] = (int)$row['id'];
  }

  $stmt->close();

  // mapa de lecciones para contar en la tabla
  $lecciones = [];
  if (!empty($ids)) {
    $in = implode(',', array_map('intval', $ids));
    $q = $conn->query("SELECT id,curso_id,titulo,contenido,video_url,orden FROM lecciones WHERE curso_id IN ($in) ORDER BY curso_id,orden ASC");

    if ($q) {
      while ($l = $q->fetch_assoc()) {
        $cid = (int)$l['curso_id'];
        if (!isset($lecciones[$cid])) {
          $lecciones[$cid] = [];
        }

        $lecciones[$cid][] = [
          'id'       => (int)$l['id'],
          'titulo'   => (string)$l['titulo'],
          'contenido'=> (string)$l['contenido'],
          'video_url'=> (string)$l['video_url'],
          'orden'    => (int)$l['orden']
        ];
      }
    }
  }

  echo json_encode(['ok' => true, 'cursos' => $cursos, 'lecciones' => $lecciones], JSON_UNESCAPED_UNICODE);
  exit;
}

// Guardar/editar curso y lecciones
$accionGuardar = isset($_POST['guardar']) || (($_POST['action'] ?? '') == 'save');
if ($accionGuardar) {
  $id = (int)($_POST['id'] ?? 0);
  $titulo = trim($_POST['titulo'] ?? '');
  $descripcion = trim($_POST['descripcion'] ?? '');
  $precio = (float)($_POST['precio'] ?? 0);
  $duracion = (int)($_POST['duracion'] ?? 0);
  $nivel = trim($_POST['nivel'] ?? 'intermedio');
  $imagen = trim($_POST['imagen_portada'] ?? '');

  if ($titulo == '' || $duracion <= 0 || $nivel == '') {
    echo json_encode(['ok' => false, 'error' => 'Datos incompletos']);
    exit;
  }

  // Lecciones: puede venir como JSON string
  $leccionesRaw = $_POST['lecciones'] ?? '[]';
  $leccionesArr = is_array($leccionesRaw) ? $leccionesRaw : json_decode($leccionesRaw, true);

  if (!is_array($leccionesArr)) {
    $leccionesArr = [];
  }

  if ($id > 0) {
    // Si es profesor, verificar propiedad del curso
    if ($tipo == 'profesor') {
      $check = $conn->prepare("SELECT id FROM cursos WHERE id=? AND profesor_id=?");
      $check->bind_param("ii", $id, $uid);
      $check->execute();
      $r = $check->get_result();

      if (!$r || $r->num_rows == 0) {
        echo json_encode(['ok' => false, 'error' => 'Este curso no te pertenece']);
        exit;
      }
      $check->close();
    }

    $stmt = $conn->prepare("UPDATE cursos SET titulo=?, descripcion=?, precio=?, duracion=?, nivel=?, imagen_portada=? WHERE id=?");
    $stmt->bind_param("ssdissi", $titulo, $descripcion, $precio, $duracion, $nivel, $imagen, $id);
    if (!$stmt->execute()) {
      echo json_encode(['ok' => false, 'error' => 'No se pudo actualizar el curso']);
      exit;
    }

    $stmt->close();
    $curso_id = $id;
  } else {
    // Crear curso (admin puede fijar profesor_id, profesor usa el suyo)
    $profesor_id = ($tipo == 'admin') ? (int)($_POST['profesor_id'] ?? $uid) : $uid;
    $stmt = $conn->prepare("INSERT INTO cursos (titulo,descripcion,precio,duracion,nivel,imagen_portada,profesor_id) VALUES (?,?,?,?,?,?,?)");
    $stmt->bind_param("ssdissi", $titulo, $descripcion, $precio, $duracion, $nivel, $imagen, $profesor_id);

    if (!$stmt->execute()) {
      echo json_encode(['ok' => false, 'error' => 'No se pudo crear el curso']);
      exit;
    }
    $curso_id = (int)$stmt->insert_id;
    $stmt->close();
  }

  // CRUD de lecciones
  $ins = $conn->prepare("INSERT INTO lecciones (curso_id,titulo,contenido,video_url,orden) VALUES (?,?,?,?,?)");
  $upd = $conn->prepare("UPDATE lecciones SET titulo=?, contenido=?, video_url=?, orden=? WHERE id=? AND curso_id=?");
  $del = $conn->prepare("DELETE FROM lecciones WHERE id=? AND curso_id=?");

  $created = 0;
  $updated = 0;
  $deleted = 0;
  foreach ($leccionesArr as $i => $L) {
    $lid = (int)($L['id'] ?? 0);
    $ltit = trim($L['titulo'] ?? '');
    $lcon = trim($L['contenido'] ?? '');
    $lvid = trim($L['video_url'] ?? '');
    $lord = (int)($L['orden'] ?? ($i + 1));
    $ldel = (int)($L['delete'] ?? 0);

    // borrar
    if ($ldel == 1 && $lid > 0) {
      $del->bind_param("ii", $lid, $curso_id);
      $del->execute();
      $deleted++;
      continue;
    }

    // ignorar fila completamente vacía sin id
    if ($lid <= 0 && $ltit == '' && $lcon == '' && $lvid == '') {
      continue;
    }

    if ($lid > 0) {
      $upd->bind_param("sssiii", $ltit, $lcon, $lvid, $lord, $lid, $curso_id);
      $upd->execute();
      $updated++;
    } else {
      $ins->bind_param("isssi", $curso_id, $ltit, $lcon, $lvid, $lord);
      $ins->execute();
      $created++;
    }
  }
  if ($ins) {
    $ins->close();
  }
  if ($upd) {
    $upd->close();
  }
  if ($del) {
    $del->close();
  }

  echo json_encode(['ok' => true, 'msg' => 'Curso y lecciones guardados', 'curso_id' => $curso_id, 'stats' => compact('created', 'updated', 'deleted')]);
  exit;
}

echo json_encode(['ok' => false, 'error' => 'Solicitud inválida']);
exit;
