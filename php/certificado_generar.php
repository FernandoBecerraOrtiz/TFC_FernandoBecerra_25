<?php

session_start();
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/libs/fpdf.php';

function pdf_text(string $txt): string {
    // TRANSLIT intenta aproximar caracteres que no existan en ISO-8859-1
    return iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $txt);
}

// Obtener conexión mysqli
if (function_exists('getConnection')) {
    $conn = getConnection();
} else {
    if (!isset($conn) || !$conn) {
        http_response_code(500);
        echo "DB no disponible";
        exit;
    }
}

// Usuario actual
$me = $_SESSION['me'] ?? $_SESSION['usuario'] ?? null;
$uid = (int)($me['id'] ?? $me['ID'] ?? 0);
$nombre = $me['nombre'] ?? 'Alumno/a';

$curso_id = isset($_GET['curso_id']) ? (int)$_GET['curso_id'] : 0;
if (!$uid || $curso_id <= 0) {
    http_response_code(400);
    echo "Parámetros inválidos";
    exit;
}

// Datos del curso
$q = $conn->prepare("SELECT id, titulo, nivel, duracion FROM cursos WHERE id=?");
$q->bind_param("i", $curso_id);
$q->execute();
$curso = $q->get_result()->fetch_assoc();
$q->close();

if (!$curso) {
    http_response_code(404);
    echo "Curso no encontrado";
    exit;
}

// Verificar completado
$sql = "SELECT 
        COUNT(DISTINCT l.id) AS total_lecciones,
        SUM(CASE WHEN p.completado = 1 THEN 1 ELSE 0 END) AS lecciones_ok
    FROM lecciones l
    LEFT JOIN progreso p 
        ON p.leccion_id = l.id AND p.usuario_id = ?
    WHERE l.curso_id = ?
";

$st = $conn->prepare($sql);
$st->bind_param("ii", $uid, $curso_id);
$st->execute();
$data = $st->get_result()->fetch_assoc();
$st->close();

$total = (int)($data['total_lecciones'] ?? 0);
$ok = (int)($data['lecciones_ok'] ?? 0);

if ($total == 0 || $ok < $total) {
    http_response_code(403);
    echo "Aún no has completado todas las lecciones de este curso.";
    exit;
}

$projectRoot = dirname(__DIR__);
$logoCandidates = [
    $projectRoot . '/assets/images/logo.png',
    $projectRoot . '/assets/images/logo.jpg',
    $projectRoot . '/assets/images/logo.webp',
    $projectRoot . '/assets/images/iessuarezdefigueroa.png',
    $projectRoot . '/assets/logo.png',
    $projectRoot . '/logo.png',
];

$logoPath = __DIR__ . '/assets/images/logo.png';
foreach ($logoCandidates as $p) {
    if (is_readable($p)) {
        $logoPath = $p;
        break;
    }
}

$pdf = new FPDF('L', 'mm', 'A4');
$pdf->AddPage();
$pdf->SetTitle("Certificado - " . $curso["titulo"]);

// Marco y fondo
$pdf->SetDrawColor(220, 53, 69);
$pdf->SetLineWidth(2);
$pdf->Rect(10, 10, 277, 190);
$pdf->SetFillColor(245, 245, 245);
$pdf->Rect(12, 12, 273, 186, "F");


if ($logoPath) {
    $w = 40;                 // ancho del logo (mm)
    $x = (297 - $w) / 2;     // centrado en A4 horizontal
    $y = 18;
    $pdf->Image($logoPath, $x, $y, $w);
}

$pdf->Ln(30);
// Título y textos
$pdf->SetTextColor(33, 37, 41);
$pdf->SetFont('Helvetica', 'B', 28);
$pdf->Ln(30);
$pdf->Cell(0, 15, pdf_text("Certificado de Finalización"), 0, 1, 'C');

$pdf->SetFont('Helvetica', '', 16);
$pdf->Ln(3);
$pdf->Cell(0, 10, "Se certifica que", 0, 1, 'C');
$pdf->SetFont('Helvetica', 'B', 24);
$pdf->SetTextColor(220, 53, 69);
$pdf->Cell(0, 14, pdf_text($nombre), 0, 1, 'C');

$pdf->SetTextColor(33, 37, 41);
$pdf->SetFont('Helvetica', '', 16);
$pdf->Ln(2);
$pdf->Cell(0, 10, pdf_text("ha completado satisfactoriamente el curso"), 0, 1, 'C');

$pdf->SetFont('Helvetica', 'B', 20);
$pdf->Cell(0, 12, pdf_text($curso['titulo']), 0, 1, 'C');

$pdf->SetFont('Helvetica', '', 12);
$pdf->Ln(2);
$detalles = "Nivel: " . ($curso['nivel'] ?? '-') . "   ·   Duración: " . (string)($curso['duracion'] ?? '-') . " horas";
$pdf->Cell(0, 8, pdf_text($detalles), 0, 1, 'C');

$pdf->Ln(8);
$pdf->Cell(0, 8, pdf_text("Fecha de emisión: " . date("d/m/Y")), 0, 1, 'C');

$pdf->Ln(16);
$pdf->SetFont('Helvetica', 'I', 12);
$pdf->Cell(0, 8, pdf_text("Foobar · Plataforma de cursos"), 0, 1, 'C');

// Salida
$filename = "certificado_" . preg_replace("/[^A-Za-z0-9]/", "_", $curso["titulo"]) . "_" . date('Ymd') . ".pdf";
header("Content-Type: application/pdf");
header("Content-Disposition: inline; filename=\"{$filename}\"");
$pdf->Output("I", $filename);
exit;
