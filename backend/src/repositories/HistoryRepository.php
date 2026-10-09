<?php

final class HistoryRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function allForUser(int $userId): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM calculation_history WHERE user_id = :user_id ORDER BY created_at DESC, id DESC');
        $stmt->execute(['user_id' => $userId]);
        return array_map(fn ($row) => $this->format($row), $stmt->fetchAll());
    }

    public function create(int $userId, array $data): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO calculation_history (user_id, category, calculator_type, calculator_name, title, input_data, result_data, total_cost, created_at)
             VALUES (:user_id, :category, :calculator_type, :calculator_name, :title, :input_data, :result_data, :total_cost, :created_at)'
        );
        $stmt->execute([
            'user_id' => $userId,
            'category' => $data['category'],
            'calculator_type' => $data['calculatorType'],
            'calculator_name' => $data['calculatorName'],
            'title' => $data['title'] ?? $data['calculatorName'],
            'input_data' => json_encode($data['inputData'] ?? []),
            'result_data' => json_encode($data['resultData'] ?? []),
            'total_cost' => (float) ($data['totalCost'] ?? ($data['resultData']['totalCost'] ?? 0)),
            'created_at' => nowDate(),
        ]);

        return $this->findForUser((int) $this->pdo->lastInsertId(), $userId);
    }

    public function findForUser(int $id, int $userId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM calculation_history WHERE id = :id AND user_id = :user_id LIMIT 1');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        $row = $stmt->fetch();
        return $row ? $this->format($row) : null;
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM calculation_history WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->rowCount() > 0;
    }

    public function allAdmin(): array
    {
        $rows = $this->pdo
            ->query('SELECT h.*, u.name AS user_name FROM calculation_history h JOIN users u ON u.id = h.user_id ORDER BY h.created_at DESC')
            ->fetchAll();
        return array_map(fn ($row) => $this->format($row), $rows);
    }

    private function format(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'userId' => (int) $row['user_id'],
            'user' => $row['user_name'] ?? null,
            'source' => 'quick',
            'category' => $row['category'],
            'calculatorType' => $row['calculator_type'],
            'calculatorName' => $row['calculator_name'],
            'title' => $row['title'],
            'inputData' => decodeJsonColumn($row['input_data']),
            'resultData' => decodeJsonColumn($row['result_data']),
            'totalCost' => (float) $row['total_cost'],
            'createdAt' => $row['created_at'],
        ];
    }
}
