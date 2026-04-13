<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/mail.php';
app_session_start();

$msg = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['_csrf'] ?? '')) {
        $error = 'Invalid session.';
    } else {
        $email = trim((string) ($_POST['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Enter a valid email.';
        } else {
            $st = $conn->prepare('SELECT id, username FROM users WHERE email = ? LIMIT 1');
            $st->bind_param('s', $email);
            $st->execute();
            $u = $st->get_result()->fetch_assoc();
            if ($u) {
                $raw = bin2hex(random_bytes(32));
                $hash = hash('sha256', $raw);
                $exp = date('Y-m-d H:i:s', time() + 3600);
                $up = $conn->prepare('UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?');
                $up->bind_param('ssi', $hash, $exp, $u['id']);
                $up->execute();
                $link = SITE_URL . '/reset-password.php?token=' . urlencode($raw) . '&email=' . urlencode($email);
                $body = "Hi {$u['username']},\n\nReset your password:\n{$link}\n\nExpires in 1 hour.\n";
                send_plain_mail($email, 'Reset your Never Quit Punjabi password', $body);
            }
            $msg = 'If that email exists, we sent reset instructions.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot password — Never Quit Punjabi</title>
    <meta name="theme-color" content="#000000">
    <link rel="icon" type="image/png" sizes="192x192" href="assets/favicon.png">
    <link rel="apple-touch-icon" href="assets/favicon.png">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="login-page">
    <div class="login-card" style="max-width:420px;">
        <?php require __DIR__ . '/includes/login-card-brand.php'; ?>
        <h1>Reset password</h1>
        <p style="color:var(--muted);font-size:0.95rem;">We will email you a link if the address is registered.</p>
        <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
        <?php if ($msg): ?><div class="alert alert-success"><?php echo e($msg); ?></div><?php endif; ?>
        <form method="post">
            <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
            <div class="form-group">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Send link</button>
        </form>
        <p style="margin-top:1rem;"><a href="login.php">Back to sign in</a></p>
    </div>
</body>
</html>
