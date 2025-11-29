<?php

require_once __DIR__ . '/db.php';

$conn = getConnection();
if (!$conn) {
    echo json_encode(['success' => [], 'error' => 'DB no disponible']);
    exit;
}

$sql = "SELECT id, nombre FROM categorias ORDER BY nombre";
$res = $conn->query($sql);

$cats = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $cats[] = $row;
    }
}

echo json_encode(['success' => $cats], JSON_UNESCAPED_UNICODE);
exit;
