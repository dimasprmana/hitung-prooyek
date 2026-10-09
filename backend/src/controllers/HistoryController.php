<?php

final class HistoryController
{
    private HistoryRepository $history;

    public function __construct()
    {
        $this->history = new HistoryRepository(Database::connection());
    }

    public function index(): void
    {
        $user = requireAuth();
        successResponse($this->history->allForUser((int) $user['id']), 'Riwayat berhasil diambil.');
    }

    public function store(): void
    {
        $user = requireAuth();
        $data = jsonInput();
        foreach (['category', 'calculatorType', 'calculatorName'] as $field) {
            if (trim($data[$field] ?? '') === '') {
                errorResponse('Data riwayat belum lengkap.', 422);
            }
        }
        successResponse($this->history->create((int) $user['id'], $data), 'Riwayat berhasil disimpan.', 201);
    }

    public function show(int $id): void
    {
        $user = requireAuth();
        $item = $this->history->findForUser($id, (int) $user['id']);

        if (!$item) {
            errorResponse('Riwayat tidak ditemukan.', 404);
        }

        successResponse($item, 'Riwayat berhasil diambil.');
    }

    public function delete(int $id): void
    {
        $user = requireAuth();
        if (!$this->history->delete($id, (int) $user['id'])) {
            errorResponse('Riwayat tidak ditemukan.', 404);
        }
        successResponse(['id' => $id], 'Riwayat berhasil dihapus.');
    }
}
