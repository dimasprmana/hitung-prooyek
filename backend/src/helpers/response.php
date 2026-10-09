<?php

function jsonInput(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function successResponse(mixed $data = null, string $message = 'Berhasil.', int $status = 200): void
{
    http_response_code($status);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data,
    ]);
    exit;
}

function errorResponse(string $message, int $status = 400): void
{
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'message' => $message,
    ]);
    exit;
}

function noContentResponse(): void
{
    http_response_code(204);
    exit;
}

function nowDate(): string
{
    return date('Y-m-d H:i:s');
}

function decodeJsonColumn(?string $value, mixed $fallback = []): mixed
{
    if (!$value) {
        return $fallback;
    }

    $decoded = json_decode($value, true);
    return $decoded === null ? $fallback : $decoded;
}
