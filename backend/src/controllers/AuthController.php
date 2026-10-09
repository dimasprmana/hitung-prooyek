<?php

final class AuthController
{
    private UserRepository $users;

    public function __construct()
    {
        $this->users = new UserRepository(Database::connection());
    }

    public function register(): void
    {
        $data = jsonInput();
        $name = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) {
            errorResponse('Nama, email valid, dan password minimal 6 karakter wajib diisi.', 422);
        }
        if ($this->users->findByEmail($email)) {
            errorResponse('Email sudah digunakan.', 409);
        }

        $user = $this->users->create($name, $email, password_hash($password, PASSWORD_DEFAULT));
        unset($user['password']);
        successResponse(['user' => $user], 'Registrasi berhasil.', 201);
    }

    public function login(): void
    {
        $data = jsonInput();
        $email = strtolower(trim($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        $user = $this->users->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            errorResponse('Email atau password salah.', 401);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        $_SESSION['role'] = $user['role'];

        unset($user['password']);
        successResponse(['user' => $user], 'Login berhasil.');
    }

    public function me(): void
    {
        successResponse(['user' => requireAuth()], 'User aktif.');
    }

    public function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'], $params['httponly']);
        }
        session_destroy();
        successResponse(null, 'Logout berhasil.');
    }

    public function forgotPassword(): void
    {
        successResponse(null, 'Jika email terdaftar, instruksi reset akan diproses.');
    }
}
