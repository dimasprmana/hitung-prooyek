<?php

final class MaterialController
{
    private MaterialRepository $materials;

    public function __construct()
    {
        $this->materials = new MaterialRepository(Database::connection());
    }

    public function index(): void
    {
        successResponse($this->materials->all(false), 'Material berhasil diambil.');
    }

    public function show(int $id): void
    {
        $material = $this->materials->find($id);

        if (!$material || $material['status'] !== 'Aktif') {
            errorResponse('Material tidak ditemukan.', 404);
        }

        successResponse($material, 'Material berhasil diambil.');
    }
}
