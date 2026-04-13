<?php
if (!current_user()) {
    header('Location: ' . SITE_URL . '/login.php');
    exit;
}
$u = current_user();
$isAdmin = $u['role'] === 'admin';
$cur = basename($_SERVER['SCRIPT_NAME'] ?? '');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? e($page_title) : 'Admin'; ?> — Never Quit Punjabi</title>
    <meta name="theme-color" content="#000000">
    <link rel="icon" type="image/png" sizes="192x192" href="../assets/favicon.png">
    <link rel="apple-touch-icon" href="../assets/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700&family=Fraunces:opsz,wght@9..144,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous">
</head>
<body class="admin-body">
<div class="admin-wrap">
    <aside class="admin-sidebar">
        <a href="../index.php" class="admin-sidebar__brand">
            <span class="logo-frame logo-frame--sidebar" aria-hidden="true">
                <img src="../assets/images/logo.png" width="192" height="192" alt="">
            </span>
            <span class="admin-sidebar__brand-text">Admin</span>
            <span class="visually-hidden">Never Quit Punjabi</span>
        </a>
        <a href="index.php" class="<?php echo $cur === 'index.php' ? 'is-active' : ''; ?>"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>
        <a href="posts.php" class="<?php echo $cur === 'posts.php' || $cur === 'post-form.php' ? 'is-active' : ''; ?>"><i class="fa-solid fa-pen-to-square"></i> Posts</a>
        <?php if ($isAdmin): ?>
            <a href="users.php" class="<?php echo $cur === 'users.php' || $cur === 'user-form.php' ? 'is-active' : ''; ?>"><i class="fa-solid fa-users"></i> Users</a>
            <a href="categories.php" class="<?php echo strpos($cur, 'categor') !== false ? 'is-active' : ''; ?>"><i class="fa-solid fa-folder"></i> Categories</a>
        <?php endif; ?>
        <a href="../profile.php"><i class="fa-solid fa-user"></i> Profile</a>
        <a href="../index.php" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> View site</a>
        <a href="../logout.php"><i class="fa-solid fa-right-from-bracket"></i> Log out</a>
    </aside>
    <div class="admin-main">
