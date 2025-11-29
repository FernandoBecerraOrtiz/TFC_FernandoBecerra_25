<?php

header('Content-Type: application/json; charset=UTF-8');
session_start();
require_once __DIR__ . '/db.php';

function out($arr, $code = 200) {
    http_response_code($code);
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($conn) || !$conn) {
    out(['ok' => false, 'error' => 'DB no disponible (mysqli)'], 500);
}

$me = $_SESSION['me'] ?? $_SESSION['usuario'] ?? null;
$tipo = $me['tipo'] ?? '';
$uid = intval($me['id'] ?? $me['ID'] ?? 0);

if (!$me || !in_array($tipo, ['profesor', 'admin'])) {
    out(['ok' => false, 'error' => 'No autorizado'], 403);
}

$check = $conn->query("SHOW TABLES LIKE 'inscripciones'");

if (!$check || $check->num_rows == 0) {
    out(['ok' => true, 'inscripciones' => []]);
}

if ($tipo == 'admin') {
    $sql = "SELECT i.id, i.curso_id, i.usuario_id, i.fecha_inscripcion,
                c.titulo AS curso, u.nombre AS alumno, u.email
            FROM inscripciones i
            JOIN cursos c   ON c.id = i.curso_id
            JOIN usuarios u ON u.id = i.usuario_id
            ORDER BY i.fecha_inscripcion DESC";
    $stmt = $conn->prepare($sql);
} else {
    $sql = "SELECT i.id, i.curso_id, i.usuario_id, i.fecha_inscripcion,
                c.titulo AS curso, u.nombre AS alumno, u.email
            FROM inscripciones i
            JOIN cursos c   ON c.id = i.curso_id
            JOIN usuarios u ON u.id = i.usuario_id
            WHERE c.profesor_id = ?
            ORDER BY i.fecha_inscripcion DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $uid);
}

if (!$stmt->execute()) {
    out(['ok' => false, 'error' => 'No se pudieron listar inscripciones'], 500);
}

$res = $stmt->get_result();
$out = [];
while ($r = $res->fetch_assoc()) {
    $r['id'] = (int)$r['id'];
    $r['curso_id'] = (int)$r['curso_id'];
    $r['usuario_id'] = (int)$r['usuario_id'];
    $out[] = $r;
}

$stmt->close();
out(['ok' => true, 'inscripciones' => $out]);
