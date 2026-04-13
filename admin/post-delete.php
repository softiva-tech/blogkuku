<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_posting_access();
require_once dirname(__DIR__) . '/includes/post_image_helpers.php';

if (!user_has_verified_posting_rights($conn, (int) current_user()['id'])) {
    header('Location: pending-verification.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !verify_csrf($_POST['_csrf'] ?? '')) {
    redirect('posts.php');
}

$id = (int) ($_POST['id'] ?? 0);
if ($id <= 0) {
    redirect('posts.php');
}

$chk = $conn->prepare('SELECT author_id FROM blog_posts WHERE id = ? LIMIT 1');
$chk->bind_param('i', $id);
$chk->execute();
$row = $chk->get_result()->fetch_assoc();
if (!$row) {
    redirect('posts.php');
}
if (current_user()['role'] === 'member' && (int) $row['author_id'] !== (int) current_user()['id']) {
    redirect('posts.php');
}

$img = $conn->prepare('SELECT featured_image FROM blog_posts WHERE id = ? LIMIT 1');
$img->bind_param('i', $id);
$img->execute();
$im = $img->get_result()->fetch_assoc();
if (!empty($im['featured_image'])) {
    delete_post_image_file($im['featured_image']);
}

$stmt = $conn->prepare('DELETE FROM blog_posts WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $id);
$stmt->execute();
redirect('posts.php');
