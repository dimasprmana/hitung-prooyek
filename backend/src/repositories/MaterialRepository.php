<?php

final class MaterialRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function all(bool $admin = false): array
    {
        $sql = $admin
            ? 'SELECT * FROM materials ORDER BY id DESC'
            : "SELECT * FROM materials WHERE status = 'Aktif' ORDER BY name ASC";
        return array_map(fn ($row) => $this->format($row), $this->pdo->query($sql)->fetchAll());
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM materials WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ? $this->format($row) : null;
    }

    public function create(array $data): array
    {
        $now = nowDate();
        $stmt = $this->pdo->prepare(
            'INSERT INTO materials (name, category, unit, price, status, created_at, updated_at)
             VALUES (:name, :category, :unit, :price, :status, :created_at, :updated_at)'
        );
        $stmt->execute([
            'name' => trim($data['name']),
            'category' => trim($data['category']),
            'unit' => trim($data['unit']),
            'price' => (float) ($data['price'] ?? 0),
            'status' => $data['status'] ?? 'Aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        return $this->find((int) $this->pdo->lastInsertId());
    }

    public function update(int $id, array $data): ?array
    {
        $stmt = $this->pdo->prepare(
            'UPDATE materials SET name = :name, category = :category, unit = :unit, price = :price, status = :status, updated_at = :updated_at WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'name' => trim($data['name']),
            'category' => trim($data['category']),
            'unit' => trim($data['unit']),
            'price' => (float) ($data['price'] ?? 0),
            'status' => $data['status'] ?? 'Aktif',
            'updated_at' => nowDate(),
        ]);
        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM materials WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function prices(int $materialId): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM material_prices WHERE material_id = :material_id ORDER BY effective_date DESC, id DESC');
        $stmt->execute(['material_id' => $materialId]);
        return array_map(fn ($row) => [
            'id' => (int) $row['id'],
            'materialId' => (int) $row['material_id'],
            'price' => (float) $row['price'],
            'region' => $row['region'],
            'date' => $row['effective_date'],
            'effectiveDate' => $row['effective_date'],
            'createdAt' => $row['created_at'],
        ], $stmt->fetchAll());
    }

    public function addPrice(int $materialId, array $data): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO material_prices (material_id, price, region, effective_date, created_at)
             VALUES (:material_id, :price, :region, :effective_date, :created_at)'
        );
        $stmt->execute([
            'material_id' => $materialId,
            'price' => (float) ($data['price'] ?? 0),
            'region' => trim($data['region'] ?? ''),
            'effective_date' => $data['effectiveDate'] ?? $data['date'] ?? date('Y-m-d'),
            'created_at' => nowDate(),
        ]);

        $update = $this->pdo->prepare('UPDATE materials SET price = :price, updated_at = :updated_at WHERE id = :id');
        $update->execute(['price' => (float) ($data['price'] ?? 0), 'updated_at' => nowDate(), 'id' => $materialId]);

        $prices = $this->prices($materialId);
        return $prices[0];
    }

    private function format(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'category' => $row['category'],
            'unit' => $row['unit'],
            'price' => (float) $row['price'],
            'status' => $row['status'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ];
    }
}
