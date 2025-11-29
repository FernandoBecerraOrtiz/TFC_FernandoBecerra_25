<?php
header('Content-Type: application/json; charset=utf-8');

@session_start();
require_once __DIR__ . '/db.php';

$conn = getConnection();
if (!$conn) {
  echo json_encode(['ok' => false, 'error' => 'DB no disponible (mysqli)'], JSON_UNESCAPED_UNICODE);
  exit;
}

$user = isset($_SESSION['me']) ? $_SESSION['me'] : null;
if (!$user) {
  echo json_encode(['ok' => false, 'error' => 'Sesión no iniciada'], JSON_UNESCAPED_UNICODE);
  exit;
}

$userId = 0;
if (is_array($user)) {
  if (isset($user['id'])) {
    $userId = (int)$user['id'];
  } elseif (isset($user['ID'])) {
    $userId = (int)$user['ID'];
  } elseif (isset($user['usuario_id'])) {
    $userId = (int)$user['usuario_id'];
  }
} else {
  $userId = (int)$user;
}

if ($userId <= 0) {
  echo json_encode(['ok' => false, 'error' => 'Usuario en sesión no válido'], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
  echo json_encode(['ok' => false, 'error' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
  exit;
}

function post_trim($key) {
  if (!isset($_POST[$key])) {
    return '';
  }
  return trim((string)$_POST[$key]);
}

$nombre = post_trim('nombre');
$foto = post_trim('foto_perfil');
$tech = post_trim('tecnologias');
$twitter = post_trim('twitter');
$github = post_trim('github');
$instagram = post_trim('instagram');
$linkedin = post_trim('linkedin');

if ($nombre == '') {
  echo json_encode(['ok' => false, 'error' => 'El nombre es obligatorio'], JSON_UNESCAPED_UNICODE);
  exit;
}

$sql = "UPDATE usuarios SET nombre = ?, foto_perfil = ?, tecnologias = ?, twitter = ?, github = ?, instagram = ?, linkedin = ? WHERE id = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
  echo json_encode(['ok' => false, 'error' => 'Error en prepare: ' . $conn->error], JSON_UNESCAPED_UNICODE);
  exit;
}

$stmt->bind_param("sssssssi", $nombre, $foto, $tech, $twitter, $github, $instagram, $linkedin, $userId);

if (!$stmt->execute()) {
  echo json_encode(['ok' => false, 'error' => 'Error al ejecutar: ' . $stmt->error], JSON_UNESCAPED_UNICODE);
  $stmt->close();
  exit;
}

// Actualizar sesión también
if (is_array($_SESSION['me'])) {
  $_SESSION['me']['nombre']      = $nombre;
  $_SESSION['me']['foto_perfil'] = $foto;
  $_SESSION['me']['tecnologias'] = $tech;
  $_SESSION['me']['twitter']     = $twitter;
  $_SESSION['me']['github']      = $github;
  $_SESSION['me']['instagram']   = $instagram;
  $_SESSION['me']['linkedin']    = $linkedin;
}

$stmt->close();
$conn->close();

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
