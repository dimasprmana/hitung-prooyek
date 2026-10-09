<?php

final class ProfileController
{
    private UserRepository $users;

    public function __construct()
    {
        $this->users = new UserRepository(Database::connection());
    }

    public function show(): void
    {
        successResponse(['user' => requireAuth()], 'Profil berhasil diambil.');
    }

    public function update(): void
    {
        $user = requireAuth();
        $data = jsonInput();
        $name = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));

        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            errorResponse('Nama dan email valid wajib diisi.', 422);
        }

        $existing = $this->users->findByEmail($email);
        if ($existing && (int) $existing['id'] !== (int) $user['id']) {
            errorResponse('Email sudah digunakan.', 409);
        }

        $updated = $this->users->updateProfile((int) $user['id'], $name, $email);
        unset($updated['password']);
        successResponse(['user' => $updated], 'Profil berhasil diperbarui.');
    }

    public function updatePassword(): void
    {
        $user = requireAuth();
        $fullUser = $this->users->findById((int) $user['id']);
        $data = jsonInput();

        if (!password_verify((string) ($data['currentPassword'] ?? ''), $fullUser['password'])) {
            errorResponse('Password lama tidak sesuai.', 422);
        }
        if (strlen((string) ($data['newPassword'] ?? '')) < 6) {
            errorResponse('Password baru minimal 6 karakter.', 422);
        }
        if (($data['newPassword'] ?? '') !== ($data['confirmPassword'] ?? '')) {
            errorResponse('Konfirmasi password tidak sama.', 422);
        }

        $this->users->updatePassword((int) $user['id'], password_hash($data['newPassword'], PASSWORD_DEFAULT));
        successResponse(null, 'Password berhasil diperbarui.');
    }
}
