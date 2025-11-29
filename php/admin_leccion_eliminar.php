<?php

header('Content-Type: application/json; charset=UTF-8');
session_start();
require_once __DIR__ . '/db.php';

function out($arr, $code = 200) {
  http_response_code($code);
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
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

$id = intval($_POST['id'] ?? 0);
$curso_id = intval($_POST['curso_id'] ?? 0);

if ($id <= 0) {
  out(['ok' => false, 'error' => 'ID de lección requerido'], 400);
}

if ($tipo != 'admin') {
  if ($curso_id <= 0) {
    $q = $conn->prepare("SELECT curso_id FROM lecciones WHERE id=?");
    $q->bind_param('i', $id);
    $q->execute();
    $r = $q->get_result();
    $row = $r ? $r->fetch_assoc() : null;
    $q->close();
    $curso_id = intval($row['curso_id'] ?? 0);
  }
  if ($curso_id > 0) {
    $ver = $conn->prepare("SELECT id FROM cursos WHERE id=? AND profesor_id=?");
    $ver->bind_param('ii', $curso_id, $uid);
    $ver->execute();
    $res = $ver->get_result();
    $ok = $res && $res->num_rows > 0;
    $ver->close();
    
    if (!$ok) {
      out(['ok' => false, 'error' => 'Curso no encontrado o sin permisos'], 404);
    }
  }
}

$st = $conn->prepare("DELETE FROM lecciones WHERE id=?");
$st->bind_param('i', $id);
$ok = $st->execute();
$st->close();

if (!$ok) {
  out(['ok' => false, 'error' => 'No se pudo eliminar la lección'], 500);
}

out(['ok' => true]);
