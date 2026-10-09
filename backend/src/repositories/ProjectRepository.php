<?php

final class ProjectRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function allForUser(int $userId): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM projects WHERE user_id = :user_id ORDER BY updated_at DESC, id DESC');
        $stmt->execute(['user_id' => $userId]);
        return array_map(fn ($project) => $this->hydrate($project), $stmt->fetchAll());
    }

    public function findForUser(int $id, int $userId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM projects WHERE id = :id AND user_id = :user_id LIMIT 1');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        $project = $stmt->fetch();
        return $project ? $this->hydrate($project) : null;
    }

    public function findAny(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT p.*, u.name AS owner FROM projects p JOIN users u ON u.id = p.user_id WHERE p.id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $project = $stmt->fetch();
        return $project ? $this->hydrate($project) : null;
    }

    public function create(int $userId, array $data): array
    {
        $now = nowDate();
        $stmt = $this->pdo->prepare(
            'INSERT INTO projects (user_id, name, note, status, total_cost, created_at, updated_at)
             VALUES (:user_id, :name, :note, :status, :total_cost, :created_at, :updated_at)'
        );
        $stmt->execute([
            'user_id' => $userId,
            'name' => trim($data['name']),
            'note' => trim($data['note'] ?? ''),
            'status' => $data['status'] ?? 'Berjalan',
            'total_cost' => (float) ($data['totalCost'] ?? 0),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $projectId = (int) $this->pdo->lastInsertId();
        foreach (($data['works'] ?? []) as $work) {
            $this->addWork($projectId, $work);
        }
        $this->recalculateTotal($projectId);

        return $this->findForUser($projectId, $userId);
    }

    public function update(int $id, int $userId, array $data): ?array
    {
        $stmt = $this->pdo->prepare(
            'UPDATE projects SET name = :name, note = :note, status = :status, updated_at = :updated_at
             WHERE id = :id AND user_id = :user_id'
        );
        $stmt->execute([
            'id' => $id,
            'user_id' => $userId,
            'name' => trim($data['name']),
            'note' => trim($data['note'] ?? ''),
            'status' => $data['status'] ?? 'Berjalan',
            'updated_at' => nowDate(),
        ]);

        return $this->findForUser($id, $userId);
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM projects WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->rowCount() > 0;
    }

    public function addWork(int $projectId, array $work): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO project_works (project_id, calculator_type, title, input_data, result_data, total_cost, created_at)
             VALUES (:project_id, :calculator_type, :title, :input_data, :result_data, :total_cost, :created_at)'
        );
        $stmt->execute([
            'project_id' => $projectId,
            'calculator_type' => $work['calculatorType'] ?? $work['type'] ?? '',
            'title' => $work['title'] ?? 'Pekerjaan',
            'input_data' => json_encode($work['inputData'] ?? []),
            'result_data' => json_encode($work['resultData'] ?? []),
            'total_cost' => (float) ($work['totalCost'] ?? ($work['resultData']['totalCost'] ?? 0)),
            'created_at' => nowDate(),
        ]);
        $this->recalculateTotal($projectId);
        return $this->findWork((int) $this->pdo->lastInsertId());
    }

    public function deleteWork(int $projectId, int $workId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM project_works WHERE id = :id AND project_id = :project_id');
        $stmt->execute(['id' => $workId, 'project_id' => $projectId]);
        $this->recalculateTotal($projectId);
        return $stmt->rowCount() > 0;
    }

    public function allAdmin(): array
    {
        $rows = $this->pdo
            ->query('SELECT p.*, u.name AS owner FROM projects p JOIN users u ON u.id = p.user_id ORDER BY p.updated_at DESC')
            ->fetchAll();
        return array_map(fn ($project) => $this->hydrate($project), $rows);
    }

    private function hydrate(array $project): array
    {
        $works = $this->works((int) $project['id']);
        return [
            'id' => (int) $project['id'],
            'userId' => (int) $project['user_id'],
            'owner' => $project['owner'] ?? null,
            'name' => $project['name'],
            'note' => $project['note'] ?? '',
            'status' => $project['status'],
            'works' => $works,
            'materialSummary' => $this->materialSummary($works),
            'totalCost' => (float) $project['total_cost'],
            'createdAt' => $project['created_at'],
            'updatedAt' => $project['updated_at'],
        ];
    }

    private function works(int $projectId): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM project_works WHERE project_id = :project_id ORDER BY id DESC');
        $stmt->execute(['project_id' => $projectId]);
        return array_map(fn ($work) => $this->formatWork($work), $stmt->fetchAll());
    }

    private function findWork(int $id): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM project_works WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $this->formatWork($stmt->fetch());
    }

    private function formatWork(array $work): array
    {
        return [
            'id' => (int) $work['id'],
            'projectId' => (int) $work['project_id'],
            'type' => $work['calculator_type'],
            'calculatorType' => $work['calculator_type'],
            'title' => $work['title'],
            'inputData' => decodeJsonColumn($work['input_data']),
            'resultData' => decodeJsonColumn($work['result_data']),
            'totalCost' => (float) $work['total_cost'],
            'createdAt' => $work['created_at'],
        ];
    }

    private function materialSummary(array $works): array
    {
        $grouped = [];
        foreach ($works as $work) {
            foreach (($work['resultData']['items'] ?? []) as $item) {
                $key = ($item['materialId'] ?? $item['name'] ?? $item['material']) . '-' . ($item['unit'] ?? '');
                if (!isset($grouped[$key])) {
                    $grouped[$key] = [
                        'materialId' => $item['materialId'] ?? null,
                        'name' => $item['name'] ?? $item['material'] ?? 'Material',
                        'material' => $item['material'] ?? $item['name'] ?? 'Material',
                        'quantity' => 0,
                        'unit' => $item['unit'] ?? '',
                        'unitPrice' => (float) ($item['unitPrice'] ?? 0),
                        'totalCost' => 0,
                    ];
                }
                $grouped[$key]['quantity'] += (float) ($item['quantity'] ?? 0);
                $grouped[$key]['totalCost'] += (float) ($item['total'] ?? $item['totalCost'] ?? 0);
            }
        }
        return array_values($grouped);
    }

    private function recalculateTotal(int $projectId): void
    {
        $stmt = $this->pdo->prepare('SELECT COALESCE(SUM(total_cost), 0) AS total FROM project_works WHERE project_id = :project_id');
        $stmt->execute(['project_id' => $projectId]);
        $total = (float) $stmt->fetch()['total'];
        $update = $this->pdo->prepare('UPDATE projects SET total_cost = :total, updated_at = :updated_at WHERE id = :id');
        $update->execute(['total' => $total, 'updated_at' => nowDate(), 'id' => $projectId]);
    }
}
