<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !verify_csrf($_POST['_csrf'] ?? '')) {
    redirect('categories.php');
}

$id = (int) ($_POST['id'] ?? 0);
if ($id <= 0) {
    redirect('categories.php');
}

$stmt = $conn->prepare('DELETE FROM categories WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $id);
$stmt->execute();
redirect('categories.php');
