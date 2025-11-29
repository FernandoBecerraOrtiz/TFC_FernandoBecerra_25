<?php

header('Content-Type: application/json; charset=UTF-8');
session_start();

require_once __DIR__ . '/db.php';

function out($arr, $code = 200) {
    http_response_code($code);
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

$conn = getConnection();
if (!$conn) {
    out(['ok' => false, 'error' => 'DB no disponible (mysqli)'], 500);
}

// Usuario logueado (debe ser profesor o admin)
$me = $_SESSION['me'] ?? $_SESSION['usuario'] ?? null;
$tipo = $me['tipo'] ?? '';
$uid = intval($me['id'] ?? $me['ID'] ?? 0);

if (!$me || !in_array($tipo, ['profesor', 'admin']) || $uid <= 0) {
    out(['ok' => false, 'error' => 'No autorizado'], 403);
}

// Parámetros
$alumnoId = isset($_POST['alumno_id']) ? intval($_POST['alumno_id']) : 0;
$cursoId = isset($_POST['curso_id'])  ? intval($_POST['curso_id'])  : 0;

if ($alumnoId <= 0 || $cursoId <= 0) {
    out(['ok' => false, 'error' => 'Parámetros inválidos'], 400);
}

// Comprobar que el curso pertenece a este profesor (o que es admin)
if ($tipo == 'profesor') {
    $stmt = $conn->prepare("SELECT id FROM cursos WHERE id = ? AND profesor_id = ?");
    if (!$stmt) {
        out(['ok' => false, 'error' => 'Error preparando verificación de curso'], 500);
    }
    $stmt->bind_param('ii', $cursoId, $uid);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows == 0) {
        $stmt->close();
        out(['ok' => false, 'error' => 'No puedes modificar inscripciones de cursos que no son tuyos'], 403);
    }
    $stmt->close();
}

// Transacción: borrar progreso + inscripción
$conn->begin_transaction();

try {
    // 1) Borrar progreso del alumno en las lecciones de ese curso
    $sqlProg = "DELETE p FROM progreso p INNER JOIN lecciones l ON p.leccion_id = l.id WHERE p.usuario_id = ? AND l.curso_id = ?";
    $stmtProg = $conn->prepare($sqlProg);
    if (!$stmtProg) {
        throw new Exception('Error preparando borrado de progreso');
    }
    $stmtProg->bind_param('ii', $alumnoId, $cursoId);
    $stmtProg->execute();
    $stmtProg->close();

    // 2) Borrar inscripción del alumno en ese curso
    $sqlIns = "DELETE FROM inscripciones WHERE usuario_id = ? AND curso_id = ?";
    $stmtIns = $conn->prepare($sqlIns);
    if (!$stmtIns) {
        throw new Exception('Error preparando borrado de inscripción');
    }
    $stmtIns->bind_param('ii', $alumnoId, $cursoId);
    $stmtIns->execute();
    $stmtIns->close();

    $conn->commit();
    out(['ok' => true]);
} catch (Exception $e) {
    $conn->rollback();
    out(['ok' => false, 'error' => $e->getMessage()], 500);
}
