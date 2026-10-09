<?php

declare(strict_types=1);

$sessionPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'sessions';
if (!is_dir($sessionPath)) {
    mkdir($sessionPath, 0775, true);
}
session_save_path($sessionPath);

session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => false,
    'path' => '/',
]);

session_start();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === 'http://localhost:5173') {
    header('Access-Control-Allow-Origin: http://localhost:5173');
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/../src/helpers/response.php';
require __DIR__ . '/../src/config/database.php';
require __DIR__ . '/../src/repositories/UserRepository.php';
require __DIR__ . '/../src/repositories/ProjectRepository.php';
require __DIR__ . '/../src/repositories/HistoryRepository.php';
require __DIR__ . '/../src/repositories/MaterialRepository.php';
require __DIR__ . '/../src/middleware/AuthMiddleware.php';
require __DIR__ . '/../src/middleware/AdminMiddleware.php';
require __DIR__ . '/../src/controllers/AuthController.php';
require __DIR__ . '/../src/controllers/ProfileController.php';
require __DIR__ . '/../src/controllers/ProjectController.php';
require __DIR__ . '/../src/controllers/HistoryController.php';
require __DIR__ . '/../src/controllers/MaterialController.php';
require __DIR__ . '/../src/controllers/AdminController.php';
require __DIR__ . '/../src/routes/api.php';

try {
    routeApi();
} catch (Throwable $error) {
    errorResponse('Terjadi kesalahan server.', 500);
}
