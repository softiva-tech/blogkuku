<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !verify_csrf($_POST['_csrf'] ?? '')) {
    redirect('users.php');
}

$id = (int) ($_POST['id'] ?? 0);
$me = (int) current_user()['id'];
if ($id <= 0 || $id === $me) {
    redirect('users.php');
}

$stmt = $conn->prepare('DELETE FROM users WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $id);
$stmt->execute();
redirect('users.php');
