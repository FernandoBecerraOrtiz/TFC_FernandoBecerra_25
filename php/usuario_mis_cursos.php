<?php

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

if (function_exists('mb_internal_encoding')) {
  mb_internal_encoding('UTF-8');
}

session_start();

$usuario_id = null;
if (isset($_SESSION['me']['id'])) {
  $usuario_id = (int) $_SESSION['me']['id'];
} elseif (isset($_GET['user_id'])) {
  $usuario_id = (int) $_GET['user_id'];
}

if (!$usuario_id) {
  echo json_encode(['ok'=>false,'error'=>'No autenticado','cursos'=>[],'success'=>[]], JSON_UNESCAPED_UNICODE);
  exit;
}

$conn = getConnection();
if (!$conn) {
  echo json_encode(['ok'=>false,'error'=>'Error de conexión','cursos'=>[],'success'=>[]], JSON_UNESCAPED_UNICODE);
  exit;
}

$check = $conn->query("SHOW TABLES LIKE 'inscripciones'");
if (!$check || $check->num_rows == 0) {
  echo json_encode(['ok'=>false,'error'=>"missing_table:inscripciones",'cursos'=>[],'success'=>[]], JSON_UNESCAPED_UNICODE);
  $conn->close();
  exit;
}

$sql = "SELECT 
    c.id            AS id,
    c.id            AS id_curso,
    c.titulo,
    c.descripcion,
    c.nivel,
    c.duracion,
    c.imagen_portada,
    u.id            AS id_profesor,
    u.nombre        AS profesor,
    u.foto_perfil
  FROM inscripciones i
  INNER JOIN cursos c  ON c.id = i.curso_id
  LEFT JOIN usuarios u ON u.id = c.profesor_id
  WHERE i.usuario_id = ?
  ORDER BY c.titulo ASC";

$stmt = $conn->prepare($sql);

if (!$stmt) {
  echo json_encode(['ok'=>false,'error'=>'Error preparando consulta','cursos'=>[],'success'=>[]], JSON_UNESCAPED_UNICODE);
  $conn->close();
  exit;
}

$stmt->bind_param('i', $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

$cursos = [];
if ($result && $result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    $cursos[] = $row;
  }
}

echo json_encode(['ok'=>true,'cursos'=>$cursos,'success'=>$cursos], JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
