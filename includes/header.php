<?php
if (!function_exists('e')) {
    require_once __DIR__ . '/functions.php';
}
if (!function_exists('current_user')) {
    require_once __DIR__ . '/functions.php';
}
app_session_start();
if (isset($conn) && file_exists(__DIR__ . '/session_sync.php')) {
    require_once __DIR__ . '/session_sync.php';
    sync_session_with_db($conn);
}
$navUser = current_user();

$assets_prefix = isset($assets_prefix) ? $assets_prefix : '';
$asset_base = ($assets_prefix === '..') ? '../assets/' : 'assets/';
$home_href = ($assets_prefix === '..') ? '../index.php' : 'index.php';
$blog_href = ($assets_prefix === '..') ? '../blog.php' : 'blog.php';
$login_href = ($assets_prefix === '..') ? '../login.php' : 'login.php';
$register_href = ($assets_prefix === '..') ? '../register.php' : 'register.php';
$profile_href = ($assets_prefix === '..') ? '../profile.php' : 'profile.php';
$dash_href = ($assets_prefix === '..') ? '../admin/index.php' : 'admin/index.php';
$logout_href = ($assets_prefix === '..') ? '../logout.php' : 'logout.php';
$page_title = isset($page_title) ? $page_title : 'Never Quit Punjabi';
$site_name = 'Never Quit Punjabi';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#000000">
    <title><?php echo e($page_title); ?></title>
    <link rel="icon" type="image/png" sizes="192x192" href="<?php echo e($asset_base); ?>favicon.png">
    <link rel="apple-touch-icon" href="<?php echo e($asset_base); ?>favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo e($asset_base); ?>css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous">
</head>
<body class="<?php echo e($body_class ?? ''); ?>">
    <header class="site-header">
        <div class="container site-header__inner">
            <a class="site-logo site-logo--image" href="<?php echo e($home_href); ?>">
                <span class="logo-frame logo-frame--header" aria-hidden="true">
                    <img src="<?php echo e($asset_base); ?>images/logo.png" width="192" height="192" alt="">
                </span>
                <span class="visually-hidden"><?php echo e($site_name); ?></span>
            </a>
            <button type="button" class="nav-toggle" aria-label="Open menu" data-nav-toggle>
                <span></span><span></span><span></span>
            </button>
            <nav class="site-nav" data-site-nav>
                <a href="<?php echo e($home_href); ?>">Home</a>
                <a href="<?php echo e($blog_href); ?>">Blog</a>
                <?php if ($navUser): ?>
                    <a href="<?php echo e($dash_href); ?>"><i class="fa-solid fa-gauge-high" aria-hidden="true"></i> Dashboard</a>
                    <a href="<?php echo e($profile_href); ?>"><i class="fa-solid fa-user" aria-hidden="true"></i> Profile</a>
                    <a href="<?php echo e($logout_href); ?>" class="site-nav__admin"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Log out</a>
                <?php else: ?>
                    <a href="<?php echo e($login_href); ?>">Log in</a>
                    <a href="<?php echo e($register_href); ?>" class="site-nav__admin">Register</a>
                <?php endif; ?>
            </nav>
        </div>
    </header>
    <main class="site-main">
