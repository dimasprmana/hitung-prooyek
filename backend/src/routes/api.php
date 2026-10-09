<?php

function routeApi(): void
{
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    if ($path === '/api/health' && $method === 'GET') {
        Database::connection()->query('SELECT 1')->fetchColumn();
        successResponse(['database' => 'sqlite'], 'HitungProyek API berjalan.');
    }

    $auth = new AuthController();
    if ($path === '/api/auth/register' && $method === 'POST') $auth->register();
    if ($path === '/api/auth/login' && $method === 'POST') $auth->login();
    if ($path === '/api/auth/logout' && $method === 'POST') $auth->logout();
    if ($path === '/api/auth/me' && $method === 'GET') $auth->me();
    if ($path === '/api/auth/forgot-password' && $method === 'POST') $auth->forgotPassword();

    $profile = new ProfileController();
    if ($path === '/api/profile' && $method === 'GET') $profile->show();
    if ($path === '/api/profile' && $method === 'PUT') $profile->update();
    if ($path === '/api/profile/password' && $method === 'PUT') $profile->updatePassword();

    $projects = new ProjectController();
    if ($path === '/api/projects' && $method === 'GET') $projects->index();
    if ($path === '/api/projects' && $method === 'POST') $projects->store();
    if (preg_match('#^/api/projects/(\d+)$#', $path, $m) && $method === 'GET') $projects->show((int) $m[1]);
    if (preg_match('#^/api/projects/(\d+)$#', $path, $m) && $method === 'PUT') $projects->update((int) $m[1]);
    if (preg_match('#^/api/projects/(\d+)$#', $path, $m) && $method === 'DELETE') $projects->delete((int) $m[1]);
    if (preg_match('#^/api/projects/(\d+)/works$#', $path, $m) && $method === 'POST') $projects->addWork((int) $m[1]);
    if (preg_match('#^/api/projects/(\d+)/works/(\d+)$#', $path, $m) && $method === 'DELETE') $projects->deleteWork((int) $m[1], (int) $m[2]);

    $history = new HistoryController();
    if ($path === '/api/history' && $method === 'GET') $history->index();
    if ($path === '/api/history' && $method === 'POST') $history->store();
    if (preg_match('#^/api/history/(\d+)$#', $path, $m) && $method === 'GET') $history->show((int) $m[1]);
    if (preg_match('#^/api/history/(\d+)$#', $path, $m) && $method === 'DELETE') $history->delete((int) $m[1]);

    $materials = new MaterialController();
    if ($path === '/api/materials' && $method === 'GET') $materials->index();
    if (preg_match('#^/api/materials/(\d+)$#', $path, $m) && $method === 'GET') $materials->show((int) $m[1]);

    $admin = new AdminController();
    if ($path === '/api/admin/dashboard' && $method === 'GET') $admin->dashboard();
    if ($path === '/api/admin/users' && $method === 'GET') $admin->users();
    if (preg_match('#^/api/admin/users/(\d+)$#', $path, $m) && $method === 'GET') $admin->user((int) $m[1]);
    if ($path === '/api/admin/materials' && $method === 'GET') $admin->materials();
    if ($path === '/api/admin/materials' && $method === 'POST') $admin->createMaterial();
    if (preg_match('#^/api/admin/materials/(\d+)$#', $path, $m) && $method === 'PUT') $admin->updateMaterial((int) $m[1]);
    if (preg_match('#^/api/admin/materials/(\d+)$#', $path, $m) && $method === 'DELETE') $admin->deleteMaterial((int) $m[1]);
    if (preg_match('#^/api/admin/materials/(\d+)/prices$#', $path, $m) && $method === 'GET') $admin->materialPrices((int) $m[1]);
    if (preg_match('#^/api/admin/materials/(\d+)/prices$#', $path, $m) && $method === 'POST') $admin->createMaterialPrice((int) $m[1]);
    if ($path === '/api/admin/projects' && $method === 'GET') $admin->projects();
    if (preg_match('#^/api/admin/projects/(\d+)$#', $path, $m) && $method === 'GET') $admin->project((int) $m[1]);
    if ($path === '/api/admin/calculations' && $method === 'GET') $admin->calculations();

    errorResponse('Endpoint tidak ditemukan.', 404);
}
