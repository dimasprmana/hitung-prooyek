<?php

function currentUser(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }

    $repo = new UserRepository(Database::connection());
    $user = $repo->findById((int) $_SESSION['user_id']);
    if (!$user) {
        return null;
    }

    unset($user['password']);
    return $user;
}

function requireAuth(): array
{
    $user = currentUser();
    if (!$user) {
        errorResponse('Anda harus login terlebih dahulu.', 401);
    }

    return $user;
}
