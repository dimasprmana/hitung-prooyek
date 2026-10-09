<?php

final class AdminController
{
    private PDO $pdo;
    private UserRepository $users;
    private ProjectRepository $projects;
    private HistoryRepository $history;
    private MaterialRepository $materials;

    public function __construct()
    {
        $this->pdo = Database::connection();
        $this->users = new UserRepository($this->pdo);
        $this->projects = new ProjectRepository($this->pdo);
        $this->history = new HistoryRepository($this->pdo);
        $this->materials = new MaterialRepository($this->pdo);
    }

    public function dashboard(): void
    {
        requireAdmin();
        $stats = [
            'totalUsers' => (int) $this->pdo->query('SELECT COUNT(*) FROM users')->fetchColumn(),
            'totalProjects' => (int) $this->pdo->query('SELECT COUNT(*) FROM projects')->fetchColumn(),
            'totalCalculations' => (int) $this->pdo->query('SELECT COUNT(*) FROM calculation_history')->fetchColumn(),
            'totalMaterials' => (int) $this->pdo->query('SELECT COUNT(*) FROM materials')->fetchColumn(),
        ];
        successResponse([
            'stats' => $stats,
            'recentUsers' => array_slice($this->users->all(), 0, 5),
            'recentProjects' => array_slice($this->projects->allAdmin(), 0, 5),
            'recentActivities' => [],
        ], 'Dashboard admin berhasil diambil.');
    }

    public function users(): void
    {
        requireAdmin();
        successResponse($this->users->all(), 'User berhasil diambil.');
    }

    public function user(int $id): void
    {
        requireAdmin();
        $user = $this->users->findById($id);
        if (!$user) {
            errorResponse('User tidak ditemukan.', 404);
        }
        unset($user['password']);
        successResponse($user, 'User berhasil diambil.');
    }

    public function materials(): void
    {
        requireAdmin();
        successResponse($this->materials->all(true), 'Material berhasil diambil.');
    }

    public function createMaterial(): void
    {
        requireAdmin();
        $data = jsonInput();
        foreach (['name', 'category', 'unit'] as $field) {
            if (trim($data[$field] ?? '') === '') {
                errorResponse('Data material belum lengkap.', 422);
            }
        }
        successResponse($this->materials->create($data), 'Material berhasil dibuat.', 201);
    }

    public function updateMaterial(int $id): void
    {
        requireAdmin();
        $data = jsonInput();
        foreach (['name', 'category', 'unit'] as $field) {
            if (trim($data[$field] ?? '') === '') {
                errorResponse('Data material belum lengkap.', 422);
            }
        }
        $material = $this->materials->update($id, $data);
        if (!$material) {
            errorResponse('Material tidak ditemukan.', 404);
        }
        successResponse($material, 'Material berhasil diperbarui.');
    }

    public function deleteMaterial(int $id): void
    {
        requireAdmin();
        if (!$this->materials->delete($id)) {
            errorResponse('Material tidak ditemukan.', 404);
        }
        successResponse(['id' => $id], 'Material berhasil dihapus.');
    }

    public function materialPrices(int $id): void
    {
        requireAdmin();
        successResponse($this->materials->prices($id), 'Harga material berhasil diambil.');
    }

    public function createMaterialPrice(int $id): void
    {
        requireAdmin();
        successResponse($this->materials->addPrice($id, jsonInput()), 'Harga material berhasil disimpan.', 201);
    }

    public function projects(): void
    {
        requireAdmin();
        successResponse($this->projects->allAdmin(), 'Project berhasil diambil.');
    }

    public function project(int $id): void
    {
        requireAdmin();
        $project = $this->projects->findAny($id);
        if (!$project) {
            errorResponse('Project tidak ditemukan.', 404);
        }
        successResponse($project, 'Project berhasil diambil.');
    }

    public function calculations(): void
    {
        requireAdmin();
        successResponse($this->history->allAdmin(), 'Perhitungan berhasil diambil.');
    }
}
