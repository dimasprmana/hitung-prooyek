<?php

function requireAdmin(): array
{
    $user = requireAuth();
    if (($user['role'] ?? '') !== 'admin') {
        errorResponse('Anda tidak memiliki akses admin.', 403);
    }

    return $user;
}
