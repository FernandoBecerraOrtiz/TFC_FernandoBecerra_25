<?php

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
if (function_exists('mb_internal_encoding')) { mb_internal_encoding('UTF-8'); }
session_start();

$usuario_id = null;
if (isset($_SESSION['me']['id'])) {
    $usuario_id = (int) $_SESSION['me']['id'];
} elseif (isset($_GET['user_id'])) { // Solo para pruebas locales
    $usuario_id = (int) $_GET['user_id'];
}

if (!$usuario_id) {
    echo json_encode([
        'ok' => false,
        'error' => 'No autenticado',
        'panel' => ['cursos_activos'=>0, 'cursos_completados'=>0, 'lecciones_pendientes'=>0]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$conn = getConnection();
if (!$conn) {
    echo json_encode([
        'ok' => false,
        'error' => 'Error de conexión a la base de datos',
        'panel' => ['cursos_activos'=>0, 'cursos_completados'=>0, 'lecciones_pendientes'=>0]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// cursos_activos
$cursos_activos = 0;
$sqlAct = "SELECT COUNT(*) AS total FROM inscripciones WHERE usuario_id = ?";
if ($stmt = $conn->prepare($sqlAct)) {
    $stmt->bind_param("i", $usuario_id);
    if ($stmt->execute()) {
        $res = $stmt->get_result();
        if ($res && ($row = $res->fetch_assoc())) {
            $cursos_activos = (int)$row['total'];
        }
    }
    $stmt->close();
}

// cursos_completados & lecciones_pendientes, por defecto 0
$cursos_completados = 0;
$lecciones_pendientes = 0;

$sqlComp = "SELECT COUNT(*) AS total FROM progreso WHERE usuario_id = ? AND completado = 1";
if ($st2 = $conn->prepare($sqlComp)) {
    $st2->bind_param("i", $usuario_id);
    if ($st2->execute()) {
        $r2 = $st2->get_result();
        if ($r2 && ($rw = $r2->fetch_assoc())) {
            $cursos_completados = (int)$rw['total'];
        }
    }
    $st2->close();
}

echo json_encode([
    'ok'    => true,
    'panel' => [
        'cursos_activos' => $cursos_activos,
        'cursos_completados' => $cursos_completados,
        'lecciones_pendientes' => $lecciones_pendientes
    ]
], JSON_UNESCAPED_UNICODE);

$conn->close();
