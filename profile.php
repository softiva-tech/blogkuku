<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/session_sync.php';
app_session_start();
sync_session_with_db($conn);
require_login();

$uid = (int) current_user()['id'];
$st = $conn->prepare('SELECT id, username, email, display_name, bio, role FROM users WHERE id = ? LIMIT 1');
$st->bind_param('i', $uid);
$st->execute();
$u = $st->get_result()->fetch_assoc();

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['_csrf'] ?? '')) {
        $error = 'Invalid session.';
    } elseif (isset($_POST['save_profile'])) {
        $display = trim((string) ($_POST['display_name'] ?? ''));
        $bio = trim((string) ($_POST['bio'] ?? ''));
        if (strlen($display) > 120) {
            $error = 'Display name too long.';
        } else {
            $up = $conn->prepare('UPDATE users SET display_name = ?, bio = ? WHERE id = ?');
            $dn = $display === '' ? null : $display;
            $b = $bio === '' ? null : $bio;
            $up->bind_param('ssi', $dn, $b, $uid);
            if ($up->execute()) {
                $success = 'Profile saved.';
                $r2 = $conn->prepare('SELECT id, username, email, display_name, bio, role FROM users WHERE id = ? LIMIT 1');
                $r2->bind_param('i', $uid);
                $r2->execute();
                $u = $r2->get_result()->fetch_assoc();
            } else {
                $error = 'Could not save.';
            }
        }
    } elseif (isset($_POST['change_password'])) {
        $cur = (string) ($_POST['current_password'] ?? '');
        $new = (string) ($_POST['new_password'] ?? '');
        $new2 = (string) ($_POST['new_password2'] ?? '');
        $ph = $conn->prepare('SELECT password_hash FROM users WHERE id = ?');
        $ph->bind_param('i', $uid);
        $ph->execute();
        $row = $ph->get_result()->fetch_assoc();
        if (!password_verify($cur, $row['password_hash'])) {
            $error = 'Current password is wrong.';
        } elseif (strlen($new) < 8 || $new !== $new2) {
            $error = 'New passwords must match (8+ characters).';
        } else {
            $h = password_hash($new, PASSWORD_DEFAULT);
            $up = $conn->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
            $up->bind_param('si', $h, $uid);
            $up->execute();
            $success = 'Password updated.';
        }
    }
}

$page_title = 'Your profile — Never Quit Punjabi';
$assets_prefix = '';
include __DIR__ . '/includes/header.php';
?>

<section class="article-wrap user-panel">
    <div class="container" style="max-width:560px;">
        <div class="user-panel__brand">
            <div class="logo-frame logo-frame--profile">
                <img src="assets/images/logo.png" width="128" height="128" alt="Never Quit Punjabi">
            </div>
        </div>
        <h1 style="font-family:var(--font-display);margin-bottom:1.5rem;">Profile</h1>
        <?php if ($error): ?><div class="alert alert-error" style="margin-bottom:1rem;"><?php echo e($error); ?></div><?php endif; ?>
        <?php if ($success): ?><div class="alert alert-success" style="margin-bottom:1rem;"><?php echo e($success); ?></div><?php endif; ?>

        <div class="form-card" style="max-width:none;">
            <h2 style="font-size:1.1rem;margin-top:0;">Public info</h2>
            <form method="post">
                <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
                <input type="hidden" name="save_profile" value="1">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" value="<?php echo e($u['username']); ?>" disabled style="background:var(--bg-subtle);color:var(--muted);">
                    <p class="form-hint">Username cannot be changed here.</p>
                </div>
                <div class="form-group">
                    <label for="display_name">Display name</label>
                    <input id="display_name" name="display_name" value="<?php echo e($u['display_name'] ?? ''); ?>">
                </div>
                <div class="form-group">
                    <label for="bio">Bio</label>
                    <textarea id="bio" name="bio" rows="4"><?php echo e($u['bio'] ?? ''); ?></textarea>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="<?php echo e($u['email']); ?>" disabled style="background:var(--bg-subtle);color:var(--muted);">
                </div>
                <button type="submit" class="btn btn-primary">Save profile</button>
            </form>
        </div>

        <div class="form-card" style="max-width:none;margin-top:1.5rem;">
            <h2 style="font-size:1.1rem;margin-top:0;">Change password</h2>
            <form method="post">
                <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
                <input type="hidden" name="change_password" value="1">
                <div class="form-group">
                    <label for="current_password">Current password</label>
                    <input id="current_password" name="current_password" type="password" autocomplete="current-password">
                </div>
                <div class="form-group">
                    <label for="new_password">New password</label>
                    <input id="new_password" name="new_password" type="password" minlength="8" autocomplete="new-password">
                </div>
                <div class="form-group">
                    <label for="new_password2">Confirm new password</label>
                    <input id="new_password2" name="new_password2" type="password" minlength="8" autocomplete="new-password">
                </div>
                <button type="submit" class="btn btn-secondary">Update password</button>
            </form>
        </div>

        <p style="margin-top:1.5rem;"><a href="admin/index.php" class="card__link">Dashboard</a> · <a href="logout.php" class="card__link">Log out</a></p>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
