<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';
app_session_start();

$token = isset($_GET['token']) ? trim((string) $_GET['token']) : (isset($_POST['token']) ? trim((string) $_POST['token']) : '');
$email = isset($_GET['email']) ? trim((string) $_GET['email']) : (isset($_POST['email']) ? trim((string) $_POST['email']) : '');

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['_csrf'] ?? '')) {
        $error = 'Invalid session.';
    } else {
        $password = (string) ($_POST['password'] ?? '');
        $password2 = (string) ($_POST['password2'] ?? '');
        if (strlen($password) < 8 || $password !== $password2) {
            $error = 'Passwords must match and be at least 8 characters.';
        } elseif ($token === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Invalid request.';
        } else {
            $th = hash('sha256', $token);
            $st = $conn->prepare('SELECT id FROM users WHERE email = ? AND password_reset_token = ? AND password_reset_expires > NOW() LIMIT 1');
            $st->bind_param('ss', $email, $th);
            $st->execute();
            $row = $st->get_result()->fetch_assoc();
            if (!$row) {
                $error = 'Invalid or expired link. Request a new reset.';
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $cl = $conn->prepare('UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?');
                $cl->bind_param('si', $hash, $row['id']);
                $cl->execute();
                $success = 'Password updated. You can sign in.';
            }
        }
    }
}

$linkOk = false;
if ($success === '' && $error === '' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    if ($token !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $th = hash('sha256', $token);
        $st = $conn->prepare('SELECT id FROM users WHERE email = ? AND password_reset_token = ? AND password_reset_expires > NOW() LIMIT 1');
        $st->bind_param('ss', $email, $th);
        $st->execute();
        $linkOk = $st->get_result()->num_rows > 0;
    }
    if (!$linkOk) {
        $error = 'Invalid or expired reset link.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New password — Never Quit Punjabi</title>
    <meta name="theme-color" content="#000000">
    <link rel="icon" type="image/png" sizes="192x192" href="assets/favicon.png">
    <link rel="apple-touch-icon" href="assets/favicon.png">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="login-page">
    <div class="login-card" style="max-width:420px;">
        <?php require __DIR__ . '/includes/login-card-brand.php'; ?>
        <h1>Set new password</h1>
        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo e($success); ?></div>
            <p><a href="login.php">Sign in</a></p>
        <?php elseif ($error && !$linkOk && $_SERVER['REQUEST_METHOD'] !== 'POST'): ?>
            <div class="alert alert-error"><?php echo e($error); ?></div>
            <p><a href="forgot-password.php">Request a new link</a></p>
        <?php else: ?>
            <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
            <form method="post">
                <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
                <input type="hidden" name="token" value="<?php echo e($token); ?>">
                <input type="hidden" name="email" value="<?php echo e($email); ?>">
                <div class="form-group">
                    <label for="password">New password</label>
                    <input id="password" name="password" type="password" required minlength="8" autocomplete="new-password">
                </div>
                <div class="form-group">
                    <label for="password2">Confirm</label>
                    <input id="password2" name="password2" type="password" required minlength="8" autocomplete="new-password">
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%;">Save password</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>
