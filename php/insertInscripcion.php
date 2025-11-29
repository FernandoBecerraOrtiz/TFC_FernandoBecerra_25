<?php

header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/db.php';

$conn = getConnection();

$usuario_id = isset($_POST['usuario_id']) ? (int)$_POST['usuario_id'] : 0;
$curso_id = isset($_POST['curso_id']) ? (int)$_POST['curso_id'] : 0;
if ($usuario_id <= 0 || $curso_id <= 0) {
    echo json_encode(['ok' => false, 'error' => 'Parámetros inválidos']);
    exit;
}

$stmt = $conn->prepare("INSERT IGNORE INTO inscripciones (usuario_id, curso_id, fecha_inscripcion) VALUES (?, ?, NOW())");
$stmt->bind_param('ii', $usuario_id, $curso_id);

if ($stmt->execute()) {
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => false, 'error' => 'No se pudo inscribir']);
}
$stmt->close();
$conn->close();
