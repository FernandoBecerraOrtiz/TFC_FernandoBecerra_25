<?php

require_once __DIR__ . '/db.php';
$conn = getConnection();

$usuario_id = intval($_POST['usuario_id'] ?? 0);
$plan = $_POST['plan'] ?? '';

if (!$usuario_id || !$plan) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Datos incompletos']);
    exit;
}

$stmt = $conn->prepare("UPDATE usuarios SET plan_seleccionado=? WHERE id=?");
$stmt->bind_param('si', $plan, $usuario_id);
$ok = $stmt->execute();
$stmt->close();

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok' => (bool)$ok]);
