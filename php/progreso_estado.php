<?php

header('Content-Type: application/json; charset=UTF-8');
session_start();
require_once __DIR__ . '/db.php';

function out($arr, $code = 200) {
    http_response_code($code);
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

if (function_exists('getConnection')) {
    $conn = getConnection();
} else {
    if (!isset($conn) || !$conn) {
        out(['ok' => false, 'error' => 'DB no disponible (mysqli)'], 500);
    }
}

$me = $_SESSION['me'] ?? $_SESSION['usuario'] ?? null;
$uid = (int)($me['id'] ?? $me['ID'] ?? 0);
if (!$uid) {
    out(['ok' => false, 'error' => 'No autenticado'], 401);
}

$curso_id = isset($_GET['curso_id']) ? (int)$_GET['curso_id'] : 0;

if ($curso_id > 0) {
    $sql = "SELECT p.leccion_id 
            FROM progreso p 
            JOIN lecciones l ON l.id = p.leccion_id
            WHERE p.usuario_id = ? AND p.completado = 1 AND l.curso_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $uid, $curso_id);
} else {
    $sql = "SELECT leccion_id FROM progreso WHERE usuario_id = ? AND completado = 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $uid);
}

$stmt->execute();
$res = $stmt->get_result();
$ids = [];
while ($r = $res->fetch_assoc()) {
    $ids[] = (int)$r['leccion_id'];
}
$stmt->close();

out(['ok' => true, 'completadas' => $ids]);
