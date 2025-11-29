<?php

require_once __DIR__ . '/db.php';
session_start();

$me = $_SESSION['me'] ?? null;
if (!$me || !isset($me['tipo'], $me['id'])) {
    echo json_encode(['ok' => false, 'error' => 'No autenticado']);
    exit;
}

$tipo = strtolower($me['tipo']);
if (!in_array($tipo, ['admin', 'profesor'], true)) {
    echo json_encode(['ok' => false, 'error' => 'No autorizado']);
    exit;
}

$conn = getConnection();
if (!$conn) {
    echo json_encode(['ok' => false, 'error' => 'DB no disponible']);
    exit;
}

$cursoId = isset($_POST['curso_id']) ? (int)$_POST['curso_id'] : 0;
if ($cursoId <= 0) {
    echo json_encode(['ok' => false, 'error' => 'curso_id inválido']);
    exit;
}

$cats = $_POST['categorias'] ?? [];
if (!is_array($cats)) $cats = [];

// Borrar categorías actuales
$stmtDel = $conn->prepare("DELETE FROM cursos_categorias WHERE curso_id = ?");
$stmtDel->bind_param('i', $cursoId);
$stmtDel->execute();
$stmtDel->close();

// Insertar nuevas
if (count($cats) > 0) {
    $stmtIns = $conn->prepare("INSERT INTO cursos_categorias (curso_id, categoria_id) VALUES (?, ?)");
    foreach ($cats as $catId) {
        $cid = (int)$catId;
        if ($cid > 0) {
            $stmtIns->bind_param('ii', $cursoId, $cid);
            $stmtIns->execute();
        }
    }
    $stmtIns->close();
}

echo json_encode(['ok' => true]);
exit;
