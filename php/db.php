<?php

$DB_CONFIG = [
    'host'     => 'db',
    'username' => 'foobar_user',
    'password' => 'foobar_pass',
    'database' => 'foobar',
    'charset'  => 'utf8mb4',
];

function getConnection(): mysqli {
    global $DB_CONFIG;
    static $conn = null;
    if ($conn == null) {
        $conn = new mysqli(
            $DB_CONFIG['host'],
            $DB_CONFIG['username'],
            $DB_CONFIG['password'],
            $DB_CONFIG['database']
        );
        if ($conn->connect_error) {
            sendJson(['error' => 'Error de conexión: '.$conn->connect_error], 500);
        }
        mysqli_set_charset($conn, "utf8mb4");
        $conn->set_charset($DB_CONFIG['charset']);
    }
    return $conn;
}

function sendJson(array $payload, int $code = 200): void {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($conn) || !($conn instanceof mysqli)) {
    $conn = getConnection();
}
