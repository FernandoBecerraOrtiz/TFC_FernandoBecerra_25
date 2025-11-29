<?php

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
if (function_exists('mb_internal_encoding')) {
  mb_internal_encoding('UTF-8');
}

$curso_id = null;

if (isset($_GET['curso_id'])) {
  $curso_id = (int) $_GET['curso_id'];
} elseif (isset($_POST['curso_id'])) {
  $curso_id = (int) $_POST['curso_id'];
}

if (!$curso_id) {
  echo json_encode(['success' => [], 'ok' => false, 'error' => 'Falta curso_id', 'lecciones' => []], JSON_UNESCAPED_UNICODE);
  exit;
}

$conn = getConnection();
if (!$conn) {
  echo json_encode(['success' => [], 'ok' => false, 'error' => 'Error de conexión', 'lecciones' => []], JSON_UNESCAPED_UNICODE);
  exit;
}

$sql = "SELECT 
    id,
    curso_id,
    titulo,
    contenido,
    video_url,
    orden
  FROM lecciones
  WHERE curso_id = ?
  ORDER BY orden ASC, id ASC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
  echo json_encode(['success' => [], 'ok' => true, 'lecciones' => []], JSON_UNESCAPED_UNICODE);
  $conn->close();
  exit;
}

$stmt->bind_param('i', $curso_id);
$stmt->execute();
$result = $stmt->get_result();

$rows = [];
if ($result && $result->num_rows > 0) {
  $rows = $result->fetch_all(MYSQLI_ASSOC);
}

$stmt->close();
$conn->close();

echo json_encode(['success' => $rows, 'ok' => true, 'lecciones' => $rows], JSON_UNESCAPED_UNICODE);
