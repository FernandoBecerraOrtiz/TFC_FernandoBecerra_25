<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

ob_start();
header('Content-Type: application/json; charset=UTF-8');
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Autoload PHPMailer (ajusta rutas si difieren)
require __DIR__ . '/libs/Exception.php';
require __DIR__ . '/libs/PHPMailer.php';
require __DIR__ . '/libs/SMTP.php';

function respond($ok, $msg = null, $extra = []) {
    ob_clean();
    http_response_code($ok ? 200 : 400);
    echo json_encode(array_merge(['ok' => (bool)$ok, 'message' => $msg], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

// Validación básica
$required = ['name', 'email', 'subject', 'message'];
foreach ($required as $f) {
    if (!isset($_POST[$f]) || trim((string)$_POST[$f]) == '') {
        respond(false, "El campo '$f' es obligatorio.");
    }
}

// Sanitización
$nombre = htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8');
$empresa = htmlspecialchars($_POST['name_business'] ?? '', ENT_QUOTES, 'UTF-8');
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$asuntoF = htmlspecialchars($_POST['subject'], ENT_QUOTES, 'UTF-8');
$mensaje = nl2br(htmlspecialchars($_POST['message'], ENT_QUOTES, 'UTF-8'));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, "El email introducido no es válido.");
}

// Contenido
$bodyHtml = "
    <h2>Nuevo mensaje desde el formulario de contacto Foobar</h2>
    <p><strong>Nombre:</strong> {$nombre}</p>
    <p><strong>Empresa:</strong> {$empresa}</p>
    <p><strong>Email:</strong> {$email}</p>
    <p><strong>Asunto:</strong> {$asuntoF}</p>
    <p><strong>Mensaje:</strong><br>{$mensaje}</p>
    <hr>
    <small>Mensaje generado automáticamente por el formulario de Foobar.</small>
";

$mail = new PHPMailer(true);

try {
    // CONFIGURACION SMTP
    $mail->isSMTP();

    // No sirve tu contraseña normal; requiere 2FA + App Password
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'fernandobecerraortiz@gmail.com';  // email Gmail
    $mail->Password   = 'tstpbdcfebwpddal';                // App Password (16 caracteres)
    $mail->Port       = 587;                               // STARTTLS
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

    // Con Gmail, el setFrom debe ser el mismo que Username
    $mail->setFrom('fernandobecerraortiz@gmail.com', 'Contacto Foobar');
    $mail->addAddress('fbecerrao01@suarezdefigueroa.es', 'Contacto Foobar');
    $mail->addReplyTo($email, $nombre);

    // Contenido
    $mail->isHTML(true);
    $mail->Subject = "Nueva consulta: " . $asuntoF;
    $mail->Body    = $bodyHtml;

    // Debug a fichero
    $mail->SMTPDebug  = 2; // 0=off, 2=info detallada
    $mail->Debugoutput = function ($str, $level) {
        @file_put_contents(__DIR__ . '/smtp_debug.log', '[' . date('c') . "] " . $str . "\n", FILE_APPEND);
    };

    $mail->send();
    respond(true, "Tu mensaje ha sido enviado correctamente.");
} catch (Exception $e) {
    // Guarda el motivo exacto
    @file_put_contents(
        __DIR__ . '/contacto_fallos.log',
        date('c') . " | ERROR SMTP: {$mail->ErrorInfo}\n",
        FILE_APPEND
    );

    // Mensaje genérico para el usuario; el detalle está en el log
    respond(false, "No se pudo enviar el mensaje. Revisa la configuración SMTP.");
}
