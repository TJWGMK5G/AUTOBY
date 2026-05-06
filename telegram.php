<?php
header('Content-Type: application/json');

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

// Валидация
$errors = [];
if (empty($name)) $errors[] = "Имя обязательно";
if (empty($phone)) $errors[] = "Телефон обязателен";
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Email некорректен";

if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

$token = "8768877889:AAGMr591PQRPQvPTDZSop99yUxm8EVF5yfU";
$chat_id = "-1003753457707";

// Формируем текст сообщения
$message = "🆕 НОВАЯ ЗАЯВКА!%0A";
$message .= "━━━━━━━━━━━━━━━━━━━━%0A";
$message .= "👤 Имя: " . urlencode($name) . "%0A";
$message .= "📞 Телефон: " . urlencode($phone) . "%0A";
$message .= "✉️ Email: " . urlencode($email) . "%0A";
$message .= "━━━━━━━━━━━━━━━━━━━━%0A";
$message .= "🕒 Время: " . urlencode(date('d.m.Y H:i:s'));

// Отправляем запрос через file_get_contents
$url = "https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&text={$message}";

$options = [
    'http' => [
        'method' => 'GET',
        'timeout' => 10,
        'ignore_errors' => true
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);

if ($response !== false) {
    $result = json_decode($response, true);
    if ($result && $result['ok']) {
        echo json_encode(['success' => true]);
    } else {
        $error = $result['description'] ?? 'Ошибка отправки';
        echo json_encode(['success' => false, 'errors' => [$error]]);
    }
} else {
    echo json_encode(['success' => false, 'errors' => ['Ошибка соединения с Telegram']]);
}
?>