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

$action   = $_GET['action'] ?? $_POST['action'] ?? '';
$curso_id = intval($_GET['curso_id'] ?? $_POST['curso_id'] ?? 0);

// LISTAR
if ($action == 'list') {
  if ($curso_id <= 0) out(['ok' => false, 'error' => 'curso_id requerido'], 400);

  if ($tipo != 'admin') {
    $ver = $conn->prepare("SELECT id FROM cursos WHERE id=? AND profesor_id=?");
    $ver->bind_param('ii', $curso_id, $uid);
    $ver->execute();
    $r = $ver->get_result();
    $ok = $r && $r->num_rows > 0;
    $ver->close();
    if (!$ok) {
      out(['ok' => false, 'error' => 'Curso no encontrado o sin permisos'], 404);
    }
  }

  $st = $conn->prepare("SELECT id,curso_id,titulo,contenido,video_url,orden FROM lecciones WHERE curso_id=? ORDER BY orden ASC");
  $st->bind_param('i', $curso_id);
  $st->execute();
  $res = $st->get_result();
  $out = [];
  while ($l = $res->fetch_assoc()) {
    $l['id'] = (int)$l['id'];
    $l['orden'] = (int)$l['orden'];
    $out[] = $l;
  }
  $st->close();
  out(['ok' => true, 'lecciones' => $out]);
}

// SAVE (una lección)
if ($action == 'save') {
  $id = intval($_POST['id'] ?? 0);
  $titulo = trim($_POST['titulo'] ?? '');
  $contenido = trim($_POST['contenido'] ?? '');
  $video_url = trim($_POST['video_url'] ?? '');
  $orden = intval($_POST['orden'] ?? 0);
  if ($curso_id <= 0 || $titulo == '') out(['ok' => false, 'error' => 'Datos incompletos'], 400);

  if ($tipo != 'admin') {
    $ver = $conn->prepare("SELECT id FROM cursos WHERE id=? AND profesor_id=?");
    $ver->bind_param('ii', $curso_id, $uid);
    $ver->execute();
    $r = $ver->get_result();
    $ok = $r && $r->num_rows > 0;
    $ver->close();
    if (!$ok) out(['ok' => false, 'error' => 'Curso no encontrado o sin permisos'], 404);
  }

  if ($id > 0) {
    $st = $conn->prepare("UPDATE lecciones SET titulo=?, contenido=?, video_url=?, orden=? WHERE id=? AND curso_id=?");
    $st->bind_param('sssiii', $titulo, $contenido, $video_url, $orden, $id, $curso_id);

    if (!$st->execute()) {
      out(['ok' => false, 'error' => 'No se pudo actualizar'], 500);
    }

    $st->close();
    out(['ok' => true, 'id' => $id]);
  } else {
    $st = $conn->prepare("INSERT INTO lecciones (curso_id,titulo,contenido,video_url,orden) VALUES (?,?,?,?,?)");
    $st->bind_param('isssi', $curso_id, $titulo, $contenido, $video_url, $orden);

    if (!$st->execute()) {
      out(['ok' => false, 'error' => 'No se pudo crear'], 500);
    }

    $newid = (int)$st->insert_id;
    $st->close();
    out(['ok' => true, 'id' => $newid]);
  }
}

out(['ok' => false, 'error' => 'Acción no válida'], 400);
