<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_posting_access();

if (user_has_verified_posting_rights($conn, (int) current_user()['id'])) {
    header('Location: ' . SITE_URL . '/admin/index.php');
    exit;
}

$page_title = 'Awaiting approval';
include __DIR__ . '/includes/layout-start.php';
?>

<div class="admin-top">
    <h1>Account pending approval</h1>
</div>

<div class="form-card" style="max-width:520px;">
    <p style="margin:0 0 1rem;line-height:1.6;">Your registration is complete. An administrator must <strong>approve your account</strong> before you can create posts.</p>
    <p style="margin:0;color:#64748b;font-size:0.95rem;">You can still update your <a href="../profile.php">profile</a>. Check back later or contact the site admin if you need access sooner.</p>
</div>

<?php include __DIR__ . '/includes/layout-end.php'; ?>
