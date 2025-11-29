<?php

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=UTF-8');

$conn = getConnection();

if (!isset($_POST['id'])) {
    echo json_encode(['ok' => false, 'error' => 'Faltan parametros']);
    exit;
}
$id = (int)$_POST['id'];

$stmt = $conn->prepare("DELETE FROM usuarios WHERE id=?");
$stmt->bind_param("i", $id);
if ($stmt->execute()) {
    echo json_encode(['ok' => true, 'msg' => 'Usuario eliminado']);
} else {
    echo json_encode(['ok' => false, 'error' => 'Error al eliminar un usuario']);
}
$stmt->close();
$conn->close();
