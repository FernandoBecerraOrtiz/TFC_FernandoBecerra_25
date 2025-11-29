<?php

header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/db.php';

$conn = getConnection();
if (!$conn) {
    echo json_encode(['ok' => false, 'error' => 'DB no disponible (mysqli)']);
    exit;
}

$profesorId = isset($_GET['profesor_id']) ? (int)$_GET['profesor_id'] : 0;

if ($profesorId <= 0) {
    echo json_encode(['ok' => false, 'error' => 'profesor_id requerido']);
    exit;
}

//  Consulta de alumnos inscritos en X cursos del mismo profesor con sus respectivos progresos
/*
    Tablas según init.sql:
    - usuarios(id, nombre, email, tipo = 'estudiante' | 'profesor' | 'admin', fecha_registro, ...)
    - cursos(id, titulo, profesor_id, ...)
    - lecciones(id, curso_id, ...)
    - inscripciones(id, usuario_id, curso_id, fecha_inscripcion, ...)
    - progreso(id, usuario_id, leccion_id, completado, ...)

    Queremos: una fila por (alumno, curso) de cursos que imparte $profesorId
*/

$sql = "SELECT
        i.usuario_id            AS alumno_id,
        u.nombre                AS alumno_nombre,
        u.email                 AS alumno_email,
        u.tipo                  AS alumno_tipo,
        u.fecha_registro        AS fecha_registro,
        i.fecha_inscripcion     AS fecha_inscripcion,
        c.id                    AS curso_id,
        c.titulo                AS curso_titulo,
        COUNT(DISTINCT l.id)    AS total_lecciones,
        SUM(CASE WHEN p.completado = 1 THEN 1 ELSE 0 END) AS lecciones_completadas
    FROM inscripciones i
    INNER JOIN cursos   c ON c.id = i.curso_id
    INNER JOIN usuarios u ON u.id = i.usuario_id
    LEFT JOIN lecciones l  ON l.curso_id = c.id
    LEFT JOIN progreso p   ON p.leccion_id = l.id AND p.usuario_id = i.usuario_id
    WHERE c.profesor_id = ?
        AND u.tipo = 'estudiante'
    GROUP BY
        i.usuario_id,
        u.nombre,
        u.email,
        u.tipo,
        u.fecha_registro,
        i.fecha_inscripcion,
        c.id,
        c.titulo
    ORDER BY
        u.nombre ASC,
        c.titulo ASC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['ok' => false, 'error' => 'Error preparando la consulta']);
    exit;
}

$stmt->bind_param('i', $profesorId);

if (!$stmt->execute()) {
    echo json_encode(['ok' => false, 'error' => 'Error ejecutando la consulta']);
    exit;
}

$res = $stmt->get_result();

$data = [];
while ($row = $res->fetch_assoc()) {
    $totalLecciones = (int)$row['total_lecciones'];
    $completadas = (int)$row['lecciones_completadas'];

    if ($totalLecciones <= 0) {
        $porcentaje = 0;
    } else {
        $porcentaje = (int)round(($completadas * 100) / $totalLecciones);
    }

    $data[] = [
        'alumno_id'            => (int)$row['alumno_id'],
        'nombre'               => (string)$row['alumno_nombre'],
        'email'                => (string)$row['alumno_email'],
        'tipo'                 => (string)$row['alumno_tipo'],
        'fecha_registro'       => (string)$row['fecha_registro'],
        'fecha_inscripcion'    => (string)$row['fecha_inscripcion'],
        'curso_id'             => (int)$row['curso_id'],
        'curso'                => (string)$row['curso_titulo'],
        'total_lecciones'      => $totalLecciones,
        'lecciones_completadas' => $completadas,
        'progreso'             => $porcentaje
    ];
}

echo json_encode([
    'ok'   => true,
    'data' => $data
], JSON_UNESCAPED_UNICODE);
