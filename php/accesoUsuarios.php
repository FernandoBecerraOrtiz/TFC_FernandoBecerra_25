<?php

header('Content-Type: application/json; charset=UTF-8');
session_start();

require_once __DIR__ . '/db.php';

$conn = getConnection();
if (!$conn) {
    echo json_encode(['ok' => false, 'error' => 'DB no disponible (mysqli)']);
    exit;
}

// Leer datos POST
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$contrasena = isset($_POST['contrasena']) ? (string)$_POST['contrasena'] : '';

if ($email == '' || $contrasena == '') {
    echo json_encode(['ok' => false, 'error' => 'Email y contraseña son obligatorios']);
    exit;
}

// Validación email:
// - mínimo 3 caracteres antes de @
// - 1 @
// - mínimo 3 caracteres después de @
// - termina en .com o .es
if (!preg_match('/^[^@\s]{3,}@[^\s@]{3,}\.(com|es)$/i', $email)) {
    echo json_encode([
        'ok'    => false,
        'error' => 'El email debe tener al menos 3 caracteres antes y después de @ y terminar en .com o .es'
    ]);
    exit;
}

// Buscar usuario por email
$sql = "SELECT * FROM usuarios WHERE email = ? LIMIT 1";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['ok' => false, 'error' => 'Error en la consulta']);
    exit;
}

$stmt->bind_param('s', $email);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();
$stmt->close();

// Si no existe → indicar que vaya a crear cuenta
if (!$user) {
    echo json_encode([
        'ok'         => false,
        'not_found'  => true,
        'email'      => $email,
        'error'      => 'Usuario no registrado'
    ]);
    exit;
}

// Comprobar contraseña (hash moderno)
$hash = $user['password'] ?? '';
$loginOk = false;

// Intentar verificar hash
if ($hash != '' && password_get_info($hash)['algo'] != 0) {
    $loginOk = password_verify($contrasena, $hash);
} else {
    // Compatibilidad por si existiera alguna contraseña antigua en texto plano
    $loginOk = hash_equals((string)$hash, $contrasena);
}

if (!$loginOk) {
    echo json_encode(['ok' => false, 'error' => 'Contraseña incorrecta']);
    exit;
}

// Login OK: preparar objeto público sin password
$me = [
    'id'          => (int)$user['id'],
    'nombre'      => $user['nombre'],
    'email'       => $user['email'],
    'tipo'        => $user['tipo'],
    'foto_perfil' => $user['foto_perfil'] ?: 'person.svg'
];

// Guardar en sesión
$_SESSION['me'] = $me;

// Responder
echo json_encode(['ok' => true, 'me' => $me], JSON_UNESCAPED_UNICODE);
exit;
