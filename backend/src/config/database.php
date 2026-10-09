<?php

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection === null) {
            $path = __DIR__ . '/../../database/hitungproyek.sqlite';
            $dir = dirname($path);

            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }

            self::$connection = new PDO('sqlite:' . $path);
            self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            self::$connection->exec('PRAGMA foreign_keys = ON');
            self::$connection->exec('PRAGMA journal_mode = WAL');
            self::$connection->exec('PRAGMA busy_timeout = 5000');
        }

        return self::$connection;
    }
}
