<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !verify_csrf($_POST['_csrf'] ?? '')) {
    redirect('users.php');
}

$id = (int) ($_POST['id'] ?? 0);
if ($id <= 0 || $id === (int) current_user()['id']) {
    redirect('users.php');
}

$action = $_POST['action'] ?? 'verify';
if ($action === 'unverify') {
    $st = $conn->prepare('UPDATE users SET verified_at = NULL WHERE id = ? AND role = ? LIMIT 1');
    $role = 'member';
    $st->bind_param('is', $id, $role);
    $st->execute();
} else {
    $st = $conn->prepare("UPDATE users SET verified_at = NOW() WHERE id = ? AND role = 'member' LIMIT 1");
    $st->bind_param('i', $id);
    $st->execute();
}

redirect('users.php');
