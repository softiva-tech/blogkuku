<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !verify_csrf($_POST['_csrf'] ?? '')) {
    redirect('users.php');
}

$id = (int) ($_POST['id'] ?? 0);
$action = $_POST['action'] ?? '';
if ($id <= 0 || $id === (int) current_user()['id']) {
    redirect('users.php');
}

$status = $action === 'block' ? 'blocked' : 'active';
$st = $conn->prepare('UPDATE users SET status = ? WHERE id = ? LIMIT 1');
$st->bind_param('si', $status, $id);
$st->execute();
redirect('users.php');
