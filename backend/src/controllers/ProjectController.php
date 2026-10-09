<?php

final class ProjectController
{
    private ProjectRepository $projects;

    public function __construct()
    {
        $this->projects = new ProjectRepository(Database::connection());
    }

    public function index(): void
    {
        $user = requireAuth();
        successResponse($this->projects->allForUser((int) $user['id']), 'Project berhasil diambil.');
    }

    public function show(int $id): void
    {
        $user = requireAuth();
        $project = $this->projects->findForUser($id, (int) $user['id']);
        if (!$project) {
            errorResponse('Project tidak ditemukan.', 404);
        }
        successResponse($project, 'Project berhasil diambil.');
    }

    public function store(): void
    {
        $user = requireAuth();
        $data = jsonInput();
        if (trim($data['name'] ?? '') === '') {
            errorResponse('Nama proyek wajib diisi.', 422);
        }
        successResponse($this->projects->create((int) $user['id'], $data), 'Project berhasil dibuat.', 201);
    }

    public function update(int $id): void
    {
        $user = requireAuth();
        $data = jsonInput();
        if (trim($data['name'] ?? '') === '') {
            errorResponse('Nama proyek wajib diisi.', 422);
        }
        $project = $this->projects->update($id, (int) $user['id'], $data);
        if (!$project) {
            errorResponse('Project tidak ditemukan.', 404);
        }
        successResponse($project, 'Project berhasil diperbarui.');
    }

    public function delete(int $id): void
    {
        $user = requireAuth();
        if (!$this->projects->delete($id, (int) $user['id'])) {
            errorResponse('Project tidak ditemukan.', 404);
        }
        successResponse(['id' => $id], 'Project berhasil dihapus.');
    }

    public function addWork(int $id): void
    {
        $user = requireAuth();
        $project = $this->projects->findForUser($id, (int) $user['id']);
        if (!$project) {
            errorResponse('Project tidak ditemukan.', 404);
        }
        $work = jsonInput();
        if (trim($work['title'] ?? '') === '') {
            errorResponse('Nama pekerjaan wajib diisi.', 422);
        }
        $this->projects->addWork($id, $work);
        successResponse($this->projects->findForUser($id, (int) $user['id']), 'Pekerjaan berhasil ditambahkan.', 201);
    }

    public function deleteWork(int $id, int $workId): void
    {
        $user = requireAuth();
        $project = $this->projects->findForUser($id, (int) $user['id']);
        if (!$project || !$this->projects->deleteWork($id, $workId)) {
            errorResponse('Pekerjaan tidak ditemukan.', 404);
        }
        successResponse($this->projects->findForUser($id, (int) $user['id']), 'Pekerjaan berhasil dihapus.');
    }
}
