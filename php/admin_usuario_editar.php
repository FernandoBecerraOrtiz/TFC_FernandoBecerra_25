<?php

header('Content-Type: application/json; charset=UTF-8');
session_start();

require_once __DIR__ . '/db.php';
$conn = getConnection();
if (!$conn) {
    echo json_encode(['ok' => false, 'error' => 'DB no disponible'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validación de ADMIN
$me = $_SESSION['me'] ?? $_SESSION['usuario'] ?? null;
$tipo = $me['tipo'] ?? '';
$uid = (int)($me['id'] ?? $me['ID'] ?? 0);

if (!$me || $tipo != 'admin') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Solo el administrador puede gestionar usuarios'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Helpers
function out($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function rolValido(string $r): string
{
    $r = strtolower(trim($r));
    $validos = ['estudiante', 'profesor', 'admin'];
    return in_array($r, $validos, true) ? $r : 'estudiante';
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// 1) LISTAR USUARIOS  (GET action=list [&tipo=...])
if ($action == 'list') {
    $filtroTip = $_GET['tipo'] ?? null;

    if ($filtroTipo) {
        $filtroTipo = rolValido($filtroTipo);
        $stmt = $conn->prepare("SELECT id, nombre, email, tipo, fecha_registro, foto_perfil FROM usuarios WHERE tipo = ? ORDER BY id ASC");
        $stmt->bind_param('s', $filtroTipo);
    } else {
        $stmt = $conn->prepare("SELECT id, nombre, email, tipo, fecha_registro, foto_perfil FROM usuarios ORDER BY id ASC");
    }

    if (!$stmt || !$stmt->execute()) {
        out(['ok' => false, 'error' => 'Error al listar usuarios'], 500);
    }

    $res = $stmt->get_result();
    $usuarios = [];
    while ($u = $res->fetch_assoc()) {
        $u['id'] = (int)$u['id'];
        $usuarios[] = $u;
    }
    $stmt->close();

    out(['ok' => true, 'usuarios' => $usuarios]);
}

// 2) CREAR / ACTUALIZAR USUARIO  (POST action=save)
if ($action == 'save') {
    $id = (int)($_POST['id'] ?? 0);
    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $tipoU = rolValido($_POST['tipo'] ?? $_POST['rol'] ?? 'estudiante');
    $pass = $_POST['password'] ?? '';

    if ($nombre == '' || $email == '') {
        out(['ok' => false, 'error' => 'Nombre y email son obligatorios'], 400);
    }

    // Evitar que el administrador se quite su propio rol de admin
    if ($id == $uid && $tipoU != 'admin') {
        out(['ok' => false, 'error' => 'No puedes quitarte tu propio rol de administrador'], 400);
    }

    // CREAR USUARIO NUEVO
    if ($id <= 0) {
        if ($pass == '') {
            out(['ok' => false, 'error' => 'La contraseña es obligatoria para nuevos usuarios'], 400);
        }

        // Comprobar email duplicado
        $chk = $conn->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
        $chk->bind_param('s', $email);
        $chk->execute();
        $res = $chk->get_result();
        if ($res && $res->num_rows > 0) {
            $chk->close();
            out(['ok' => false, 'error' => 'Ya existe un usuario con ese email'], 400);
        }
        $chk->close();

        $hash = password_hash($pass, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, password, tipo) VALUES (?, ?, ?, ?)");
        if (!$stmt) {
            out(['ok' => false, 'error' => 'Error preparando INSERT'], 500);
        }

        $stmt->bind_param('ssss', $nombre, $email, $hash, $tipoU);

        if (!$stmt->execute()) {
            $msg = $stmt->error ?: 'No se pudo crear el usuario';
            $stmt->close();
            out(['ok' => false, 'error' => $msg], 500);
        }

        $newId = (int)$stmt->insert_id;
        $stmt->close();

        out(['ok' => true, 'msg' => 'Usuario creado', 'id' => $newId]);
    }

    // ACTUALIZAR USUARIO EXISTENTE

    // Comprobar email duplicado en OTRO usuario
    $chk = $conn->prepare("SELECT id FROM usuarios WHERE email = ? AND id <> ? LIMIT 1");
    $chk->bind_param('si', $email, $id);
    $chk->execute();
    $res = $chk->get_result();
    if ($res && $res->num_rows > 0) {
        $chk->close();
        out(['ok' => false, 'error' => 'Ya existe otro usuario con ese email'], 400);
    }
    $chk->close();

    // Si viene nueva contraseña, se actualiza; si no, se deja la que ya tiene
    if ($pass != '') {
        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, email = ?, tipo = ?, password = ? WHERE id = ?");
        if (!$stmt) {
            out(['ok' => false, 'error' => 'Error preparando UPDATE con password'], 500);
        }
        $stmt->bind_param('ssssi', $nombre, $email, $tipoU, $hash, $id);
    } else {
        $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, email = ?, tipo = ? WHERE id = ?");
        if (!$stmt) {
            out(['ok' => false, 'error' => 'Error preparando UPDATE'], 500);
        }
        $stmt->bind_param('sssi', $nombre, $email, $tipoU, $id);
    }

    if (!$stmt->execute()) {
        $msg = $stmt->error ?: 'No se pudo actualizar el usuario';
        $stmt->close();
        out(['ok' => false, 'error' => $msg], 500);
    }

    $stmt->close();
    out(['ok' => true, 'msg' => 'Usuario actualizado', 'id' => $id]);
}

// 3) ELIMINAR USUARIO  (POST action=delete)
if ($action == 'delete') {
    $id = (int)($_POST['id'] ?? 0);

    if ($id <= 0) {
        out(['ok' => false, 'error' => 'ID inválido'], 400);
    }

    // No permitir que el admin se borre a sí mismo
    if ($id == $uid) {
        out(['ok' => false, 'error' => 'No puedes eliminar tu propio usuario'], 400);
    }

    $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
    if (!$stmt) {
        out(['ok' => false, 'error' => 'Error preparando DELETE'], 500);
    }

    $stmt->bind_param('i', $id);

    if (!$stmt->execute()) {
        $msg = $stmt->error ?: 'No se pudo eliminar el usuario';
        $stmt->close();
        out(['ok' => false, 'error' => $msg], 500);
    }

    $stmt->close();
    out(['ok' => true, 'msg' => 'Usuario eliminado', 'id' => $id]);
}

// Acción no válida
out(['ok' => false, 'error' => 'Acción no válida'], 400);
