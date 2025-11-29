<?php

require_once __DIR__ . '/db.php';

$conn = getConnection();
if (!$conn) {
    echo json_encode(['error' => 'DB no disponible']);
    exit;
}

$sql = "SELECT 
        c.id,
        c.titulo,
        c.descripcion,
        c.precio,
        c.nivel,
        c.duracion,
        c.imagen_portada,
        u.id AS id_profesor,
        u.foto_perfil,
        GROUP_CONCAT(DISTINCT cat.id ORDER BY cat.id SEPARATOR ',')       AS categorias_ids,
        GROUP_CONCAT(DISTINCT cat.nombre ORDER BY cat.nombre SEPARATOR ',') AS categorias_nombres
    FROM cursos AS c
    INNER JOIN usuarios AS u ON c.profesor_id = u.id
    LEFT JOIN cursos_categorias cc ON cc.curso_id = c.id
    LEFT JOIN categorias cat       ON cat.id = cc.categoria_id
    WHERE u.tipo = 'profesor'
    GROUP BY 
        c.id, c.titulo, c.descripcion, c.precio, c.nivel, c.duracion,
        c.imagen_portada, u.id, u.foto_perfil
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'No se pudo preparar la consulta']);
    exit;
}

$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $cursos = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['success' => $cursos], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => []], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
