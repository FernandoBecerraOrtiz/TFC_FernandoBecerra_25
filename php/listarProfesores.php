<?php

require_once __DIR__ . '/db.php';

$conn = getConnection();

$sql = "SELECT * FROM usuarios WHERE tipo = 'profesor'";
$stmt = $conn->prepare($sql);

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $profesores = $result->fetch_all(MYSQLI_ASSOC);
    //JSON_UNESCAPED_UNICODE para que muestre correctamente los caracteres especiales como la Ñ
    echo json_encode(["success" => $profesores], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["error" => []]);
}

$stmt->close();
$conn->close();
