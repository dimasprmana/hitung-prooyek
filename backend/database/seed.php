<?php

declare(strict_types=1);

require __DIR__ . '/../src/config/database.php';

$pdo = Database::connection();
$schema = file_get_contents(__DIR__ . '/schema.sql');
$pdo->exec($schema);

$now = date('Y-m-d H:i:s');

$admin = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$admin->execute(['email' => 'admin@hitungproyek.com']);

if (!$admin->fetch()) {
    $insert = $pdo->prepare(
        'INSERT INTO users (name, email, password, role, created_at, updated_at)
         VALUES (:name, :email, :password, :role, :created_at, :updated_at)'
    );
    $insert->execute([
        'name' => 'Administrator',
        'email' => 'admin@hitungproyek.com',
        'password' => password_hash('admin123', PASSWORD_DEFAULT),
        'role' => 'admin',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
}

$materials = [
    ['Bata Merah', 'Dinding', 'pcs', 1000],
    ['Semen Portland', 'Semen', 'sak', 72000],
    ['Pasir', 'Agregat', 'm3', 280000],
    ['Batu Split', 'Agregat', 'm3', 310000],
    ['Besi Beton', 'Besi', 'kg', 14500],
    ['Baja Ringan', 'Rangka Atap', 'm2', 145000],
    ['Keramik', 'Lantai', 'dus', 120000],
    ['Cat Tembok', 'Cat', 'liter', 60000],
    ['Papan Gypsum', 'Plafon', 'lembar', 65000],
    ['Wallpaper', 'Dinding', 'roll', 45000],
    ['Vinyl & SPC', 'Lantai', 'box', 175000],
];

$exists = $pdo->prepare('SELECT id FROM materials WHERE name = :name LIMIT 1');
$insertMaterial = $pdo->prepare(
    'INSERT INTO materials (name, category, unit, price, status, created_at, updated_at)
     VALUES (:name, :category, :unit, :price, :status, :created_at, :updated_at)'
);

foreach ($materials as [$name, $category, $unit, $price]) {
    $exists->execute(['name' => $name]);
    if ($exists->fetch()) {
        continue;
    }

    $insertMaterial->execute([
        'name' => $name,
        'category' => $category,
        'unit' => $unit,
        'price' => $price,
        'status' => 'Aktif',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
}

echo "Database SQLite siap dan admin development tersedia.\n";
