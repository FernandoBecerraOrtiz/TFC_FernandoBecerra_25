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
    out(['ok' => true, 'certificados' => []]);
}

$sql = "SELECT 
        c.id AS curso_id,
        c.titulo,
        COUNT(DISTINCT l.id) AS total_lecciones,
        SUM(CASE WHEN p.completado = 1 THEN 1 ELSE 0 END) AS lecciones_ok
    FROM cursos c
    JOIN lecciones l ON l.curso_id = c.id
    LEFT JOIN progreso p 
            ON p.leccion_id = l.id AND p.usuario_id = ?
    GROUP BY c.id
    HAVING total_lecciones > 0 AND total_lecciones = lecciones_ok
    ORDER BY c.titulo ASC
";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $uid);
$stmt->execute();
$res = $stmt->get_result();

$certs = [];
while ($row = $res->fetch_assoc()) {
    $certs[] = [
        'curso_id' => (int)$row['curso_id'],
        'titulo' => $row['titulo'],
        'fecha' => date('Y-m-d'),
        'certificado_url' => 'php/certificado_generar.php?curso_id=' . (int)$row['curso_id'] . '&v=' . time()
    ];
}
$stmt->close();

out(['ok' => true, 'certificados' => $certs]);
