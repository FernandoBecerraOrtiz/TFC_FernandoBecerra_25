<?php

require_once __DIR__ . '/db.php';
session_start();

$me = $_SESSION['me'] ?? null;
if (!$me) {
    echo json_encode(['ok' => false, 'error' => 'No autenticado']);
    exit;
}

$conn = getConnection();
if (!$conn) {
    echo json_encode(['ok' => false, 'error' => 'DB no disponible']);
    exit;
}

$cursoId = isset($_GET['curso_id']) ? (int)$_GET['curso_id'] : 0;
if ($cursoId <= 0) {
    echo json_encode(['ok' => false, 'error' => 'curso_id inválido']);
    exit;
}

$sql = "SELECT categoria_id FROM cursos_categorias WHERE curso_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $cursoId);
$stmt->execute();
$res = $stmt->get_result();

$ids = [];
while ($row = $res->fetch_assoc()) {
    $ids[] = (int)$row['categoria_id'];
}

$stmt->close();
echo json_encode(['ok' => true, 'categorias' => $ids]);
exit;
