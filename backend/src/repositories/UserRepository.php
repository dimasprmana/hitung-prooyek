<?php

final class UserRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => strtolower($email)]);
        return $stmt->fetch() ?: null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function create(string $name, string $email, string $passwordHash, string $role = 'user'): array
    {
        $now = nowDate();
        $stmt = $this->pdo->prepare(
            'INSERT INTO users (name, email, password, role, created_at, updated_at)
             VALUES (:name, :email, :password, :role, :created_at, :updated_at)'
        );
        $stmt->execute([
            'name' => $name,
            'email' => strtolower($email),
            'password' => $passwordHash,
            'role' => $role,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return $this->findById((int) $this->pdo->lastInsertId());
    }

    public function updateProfile(int $id, string $name, string $email): array
    {
        $stmt = $this->pdo->prepare(
            'UPDATE users SET name = :name, email = :email, updated_at = :updated_at WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'name' => $name,
            'email' => strtolower($email),
            'updated_at' => nowDate(),
        ]);

        return $this->findById($id);
    }

    public function updatePassword(int $id, string $passwordHash): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE users SET password = :password, updated_at = :updated_at WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'password' => $passwordHash,
            'updated_at' => nowDate(),
        ]);
    }

    public function all(): array
    {
        return $this->pdo
            ->query('SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY id DESC')
            ->fetchAll();
    }
}
