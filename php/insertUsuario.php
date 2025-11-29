<?php

header('Content-Type: application/json; charset=UTF-8');
session_start();

require_once __DIR__ . '/db.php';

// Obtener conexión (mysqli)
if (function_exists('getConnection')) {
    $conn = getConnection();
} elseif (isset($conn) && $conn instanceof mysqli) {
    // $conn ya viene creado desde db.php
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'DB no disponible (mysqli)'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Parámetros de entrada desde registro.js
$nombre = trim($_POST['nombre'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$tipo = $_POST['tipo'] ?? 'estudiante';   // por defecto
$foto = $_POST['foto_perfil'] ?? 'person.svg';   // por defecto

if ($nombre == '' || $email == '' || $password == '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Faltan datos obligatorios'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validación básica de email (el frontend ya valida .com/.es)
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Email inválido'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Hashear la contraseña
$hash = password_hash($password, PASSWORD_DEFAULT);
if ($hash == false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo hashear la contraseña'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Insertar usuario (controlando email duplicado)
$stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, password, tipo, foto_perfil) VALUES (?, ?, ?, ?, ?)");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error al preparar la inserción: ' . $conn->error], JSON_UNESCAPED_UNICODE);
    exit;
}

$stmt->bind_param('sssss', $nombre, $email, $hash, $tipo, $foto);

if (!$stmt->execute()) {
    $errno = $conn->errno;
    $err = $conn->error;
    $stmt->close();

    if ($errno == 1062) { // clave duplicada (email)
        http_response_code(409);
        echo json_encode(['ok' => false, 'error' => 'El email ya está en uso'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error al insertar usuario: ' . $err], JSON_UNESCAPED_UNICODE);
    exit;
}

$newId = $stmt->insert_id;
$stmt->close();

// Leer usuario recién creado para devolverlo al frontend

$stmt = $conn->prepare("SELECT id, nombre, email, tipo, foto_perfil, fecha_registro FROM usuarios WHERE id = ? LIMIT 1");

if ($stmt) {
    $stmt->bind_param('i', $newId);
    $stmt->execute();
    $res = $stmt->get_result();
    $u   = $res->fetch_assoc();
    $stmt->close();
} else {
    // Fallback si falla el SELECT
    $u = [
        'id'          => (int)$newId,
        'nombre'      => $nombre,
        'email'       => $email,
        'tipo'        => $tipo,
        'foto_perfil' => $foto,
        'fecha_registro' => date('Y-m-d H:i:s'),
    ];
}

// Iniciar sesión automáticamente
if ($u && is_array($u)) {
    $me = [
        'id'          => (int)$u['id'],
        'nombre'      => $u['nombre'],
        'email'       => $u['email'],
        'tipo'        => $u['tipo'],
        'foto_perfil' => $u['foto_perfil'] ?? null,
    ];
    $_SESSION['me'] = $me;
}

// Respuesta JSON para registro.js
echo json_encode(['ok' => true, 'usuario' => $u], JSON_UNESCAPED_UNICODE);
exit;
