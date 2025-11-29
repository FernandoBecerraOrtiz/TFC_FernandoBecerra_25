<?php

header('Content-Type: application/json; charset=UTF-8');
session_start();

require_once __DIR__ . '/db.php';
$conn = getConnection();

function out($ok, $extra = [], $code = 200) {
    http_response_code($ok ? $code : 400);
    echo json_encode(array_merge(['ok' => $ok], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    out(false, ['error' => 'Método no permitido'], 405);
}

// Usuario: de la sesión o (solo dev) por POST
$me = $_SESSION['me'] ?? $_SESSION['usuario'] ?? null;
$user_id = null;

if (is_array($me)) {
    $user_id = $me['id'] ?? $me['ID'] ?? null;
}

if (!$user_id) {
    $user_id = isset($_POST['user_id']) && is_numeric($_POST['user_id']) ? intval($_POST['user_id']) : null;
}

if (!$user_id) {
    out(false, ['error' => 'No autenticado'], 401);
}

// Parámetros
$leccion_id = isset($_POST['leccion_id']) && is_numeric($_POST['leccion_id']) ? intval($_POST['leccion_id']) : 0;
$curso_id = isset($_POST['curso_id']) && is_numeric($_POST['curso_id']) ? intval($_POST['curso_id']) : 0;

if ($leccion_id <= 0) {
    out(false, ['error' => 'Parámetros inválidos (leccion_id)']);
}

// (Opcional) validar que la lección existe y (si mandan curso_id) que coincide
$st = $conn->prepare("SELECT id, curso_id FROM lecciones WHERE id=? LIMIT 1");
$st->bind_param('i', $leccion_id);
$st->execute();

$lec = $st->get_result()->fetch_assoc();
$st->close();

if (!$lec) {
    out(false, ['error' => 'Lección no encontrada']);
}

if ($curso_id && intval($lec['curso_id']) != $curso_id) {
    $curso_id = intval($lec['curso_id']); // normaliza
}

// ¿Existe progreso para (usuario, lección)?
$sel = $conn->prepare("SELECT id, completado FROM progreso WHERE usuario_id=? AND leccion_id=? LIMIT 1");
$sel->bind_param('ii', $user_id, $leccion_id);
$sel->execute();
$cur = $sel->get_result()->fetch_assoc();
$sel->close();

if (!$cur) {
    // no existe → insertar con completado = 1
    $ins = $conn->prepare("INSERT INTO progreso (usuario_id, leccion_id, completado) VALUES (?, ?, 1)");
    $ins->bind_param('ii', $user_id, $leccion_id);
    if (!$ins->execute()) {
        $ins->close();
        out(false, ['error' => 'No se pudo insertar']);
    }
    $ins->close();
    out(true, ['accion' => 'insert', 'completado' => 1, 'leccion_id' => $leccion_id, 'usuario_id' => $user_id]);
}

$pid = intval($cur['id']);
$comp = intval($cur['completado']);

// existe:
// si completado = 1 -> DELETE (desmarcar totalmente)
// si completado = 0 -> UPDATE a 1 (marcar)
if ($comp == 1) {
    $del = $conn->prepare("DELETE FROM progreso WHERE id=?");
    $del->bind_param('i', $pid);
    if (!$del->execute()) {
        $del->close();
        out(false, ['error' => 'No se pudo desmarcar']);
    }
    $del->close();
    out(true, ['accion' => 'delete', 'completado' => 0, 'leccion_id' => $leccion_id, 'usuario_id' => $user_id]);
} else {
    $upd = $conn->prepare("UPDATE progreso SET completado=1, fecha_actualizacion=NOW() WHERE id=?");
    $upd->bind_param('i', $pid);
    if (!$upd->execute()) {
        $upd->close();
        out(false, ['error' => 'No se pudo actualizar']);
    }
    $upd->close();
    out(true, ['accion' => 'update', 'completado' => 1, 'leccion_id' => $leccion_id, 'usuario_id' => $user_id]);
}
