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

    public function downloadMaterialTemplate(): void
    {
        requireAdmin();

        try {
            $xlsx = XlsxHelper::generateTemplate();
        } catch (Throwable $e) {
            errorResponse('Gagal membuat template Excel.', 500);
        }

        // Send XLSX file directly without leaving any server path exposed
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="template_import_material.xlsx"');
        header('Content-Length: ' . strlen($xlsx));
        header('Cache-Control: no-cache, no-store, must-revalidate');
        echo $xlsx;
        exit;
    }

    public function previewMaterialImport(): void
    {
        requireAdmin();

        if (empty($_FILES['file'])) {
            errorResponse('Tidak ada file yang diunggah.', 422);
        }

        $file = $_FILES['file'];

        // Validate upload error code
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $messages = [
                UPLOAD_ERR_INI_SIZE   => 'Ukuran file melebihi batas server.',
                UPLOAD_ERR_FORM_SIZE  => 'Ukuran file melebihi batas form.',
                UPLOAD_ERR_PARTIAL    => 'File hanya terunggah sebagian.',
                UPLOAD_ERR_NO_FILE    => 'Tidak ada file yang diunggah.',
                UPLOAD_ERR_NO_TMP_DIR => 'Folder sementara server tidak ditemukan.',
                UPLOAD_ERR_CANT_WRITE => 'File tidak dapat ditulis ke server.',
                UPLOAD_ERR_EXTENSION  => 'Ekstensi PHP menghentikan upload.',
            ];
            $msg = $messages[$file['error']] ?? 'Kesalahan upload tidak dikenal.';
            errorResponse($msg, 422);
        }

        // Validate extension (do not trust MIME from browser alone)
        $originalName = $file['name'] ?? '';
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if ($ext !== 'xlsx') {
            errorResponse('Hanya file Excel (.xlsx) yang didukung.', 422);
        }

        $tmpPath = $file['tmp_name'];
        if (!is_uploaded_file($tmpPath)) {
            errorResponse('File tidak valid.', 422);
        }

        // Read rows
        try {
            $rawRows = XlsxHelper::read($tmpPath);
        } catch (InvalidArgumentException $e) {
            errorResponse($e->getMessage(), 422);
        } catch (RuntimeException $e) {
            errorResponse($e->getMessage(), 422);
        }

        // Get existing material names for duplicate detection
        $existingNames = $this->materials->existingNamesMap();

        // Validate and map rows
        try {
            $result = XlsxHelper::processAndValidate($rawRows, $existingNames);
        } catch (InvalidArgumentException $e) {
            errorResponse($e->getMessage(), 422);
        }

        successResponse($result, 'Preview berhasil diproses.');
    }

    public function importMaterials(): void
    {
        requireAdmin();

        $data = jsonInput();

        // Expect: { rows: [{ name, category, unit, price, status, isValid, isDuplicate }] }
        if (!isset($data['rows']) || !is_array($data['rows'])) {
            errorResponse('Data import tidak valid.', 422);
        }

        $rows = $data['rows'];

        if (count($rows) === 0) {
            errorResponse('Tidak ada data untuk diimpor.', 422);
        }

        // Only import rows that are valid and not duplicates
        $toInsert = array_values(array_filter($rows, function ($row) {
            return
                !empty($row['isValid']) &&
                empty($row['isDuplicate']);
        }));

        if (count($toInsert) === 0) {
            errorResponse('Tidak ada baris valid dan bukan duplikat yang dapat diimpor.', 422);
        }

        // Cap at 1000 rows
        if (count($toInsert) > 1000) {
            errorResponse('Jumlah baris yang dapat diimpor sekaligus maksimum 1000.', 422);
        }

        // Re-validate each row to prevent trust of client-provided data
        $existingNames = $this->materials->existingNamesMap();
        $cleanRows = [];
        foreach ($toInsert as $row) {
            $name     = trim((string) ($row['name'] ?? ''));
            $category = trim((string) ($row['category'] ?? ''));
            $unit     = trim((string) ($row['unit'] ?? ''));
            $price    = (float) ($row['price'] ?? 0);
            $status   = in_array($row['status'] ?? '', ['Aktif', 'Nonaktif'], true)
                ? $row['status']
                : 'Aktif';

            if ($name === '' || $category === '' || $unit === '' || $price < 0) {
                continue; // Server-side safety skip
            }

            if (isset($existingNames[mb_strtolower($name)])) {
                continue; // Already exists — skip silently
            }

            $cleanRows[] = [
                'name'     => $name,
                'category' => $category,
                'unit'     => $unit,
                'price'    => $price,
                'status'   => $status,
            ];
        }

        if (count($cleanRows) === 0) {
            errorResponse('Setelah validasi server, tidak ada baris baru yang dapat disimpan.', 422);
        }

        try {
            $result = $this->materials->bulkImport($cleanRows);
        } catch (Throwable $e) {
            errorResponse('Kesalahan saat menyimpan data ke database.', 500);
        }

        successResponse($result, 'Import selesai. ' . $result['inserted'] . ' material berhasil ditambahkan.', 201);
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
