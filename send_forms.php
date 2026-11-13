<?php
declare(strict_types=1);

$recipient = 'info@solar-invest.ro';
$sender = 'info@solar-invest.ro';
$language = ($_POST['lang'] ?? '') === 'hu' ? 'hu' : 'ro';
$messages = [
    'hu' => [
        'invalid' => 'Ellenőrizd a megadott adatokat és fogadd el az adatkezelési feltételeket.',
        'success' => 'Köszönjük! Az üzenetedet elküldtük.',
        'failure' => 'Az üzenet küldése nem sikerült. Kérjük, próbáld újra később.',
        'back' => 'Vissza az oldalra',
    ],
    'ro' => [
        'invalid' => 'Verificați datele și acceptați politica de confidențialitate.',
        'success' => 'Vă mulțumim! Mesajul a fost trimis.',
        'failure' => 'Mesajul nu a putut fi trimis. Vă rugăm să încercați din nou mai târziu.',
        'back' => 'Înapoi la site',
    ],
];

function respond(int $status, string $message, string $language, string $back): never
{
    http_response_code($status);
    header('Content-Type: text/html; charset=UTF-8');
    $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $back = htmlspecialchars($back, ENT_QUOTES, 'UTF-8');
    echo '<!doctype html><html lang="' . $language . '"><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<title>Solar Invest</title><body><p>' . $message . '</p><a href="'
        . $language . '/index.html">' . $back . '</a></body></html>';
    exit;
}

$text = $messages[$language];
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, $text['invalid'], $language, $text['back']);
}

foreach (['name', 'email', 'phone', 'message', 'investment', 'consent'] as $field) {
    if (isset($_POST[$field]) && !is_string($_POST[$field])) {
        respond(400, $text['invalid'], $language, $text['back']);
    }
}
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');
$investment = trim($_POST['investment'] ?? '');
if (
    $name === '' || strlen($name) > 200 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 ||
    !preg_match('/^\+?[0-9 ]{10,20}$/', $phone) ||
    strlen($message) > 10000 ||
    ($investment !== '' && !preg_match('/^\d+(?:\.\d{1,2})?$/', $investment)) ||
    ($_POST['consent'] ?? '') !== '1' ||
    preg_match('/[\r\n]/', $name . $email . $phone)
) {
    respond(400, $text['invalid'], $language, $text['back']);
}

$body = "Name: $name\nEmail: $email\nPhone: $phone\nInvestment: $investment\n\n$message\n";
$headers = [
    'From' => $sender,
    'Reply-To' => $email,
    'Content-Type' => 'text/plain; charset=UTF-8',
];
if (!mail($recipient, 'Solar Invest - contact request', $body, $headers)) {
    error_log('Solar Invest: contact email could not be sent.');
    respond(500, $text['failure'], $language, $text['back']);
}
respond(200, $text['success'], $language, $text['back']);
