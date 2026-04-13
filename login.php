<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';
app_session_start();

if (current_user()) {
    header('Location: ' . SITE_URL . '/admin/index.php');
    exit;
}

$gcfg = require __DIR__ . '/config/google.php';
$googleOk = $gcfg['client_id'] !== '' && $gcfg['client_secret'] !== '';

$error = '';
$notice = $_GET['notice'] ?? '';
if ($notice === 'blocked') {
    $error = 'Your account has been blocked. Contact support.';
} elseif ($notice === 'oauth') {
    $error = 'Google sign-in failed. Check OAuth credentials and redirect URI in Google Cloud Console.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['_csrf'] ?? '')) {
        $error = 'Invalid session. Refresh and try again.';
    } else {
        $login = trim((string) ($_POST['login'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        if ($login === '' || $password === '') {
            $error = 'Enter email/username and password.';
        } else {
            $stmt = $conn->prepare('SELECT id, username, email, password_hash, role, status, verified_at FROM users WHERE username = ? OR email = ? LIMIT 1');
            $stmt->bind_param('ss', $login, $login);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            if ($row && ($row['status'] ?? 'active') === 'blocked') {
                $error = 'This account is blocked.';
            } elseif ($row && password_verify($password, $row['password_hash'])) {
                set_session_from_user($row);
                $next = isset($_GET['next']) ? trim((string) $_GET['next']) : '';
                if ($next !== '' && strpos($next, '..') === false && strpos($next, '://') === false) {
                    header('Location: ' . SITE_URL . '/' . ltrim($next, '/'));
                } else {
                    header('Location: ' . SITE_URL . '/admin/index.php');
                }
                exit;
            } else {
                $error = 'Invalid credentials.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in — Never Quit Punjabi</title>
    <meta name="theme-color" content="#000000">
    <link rel="icon" type="image/png" sizes="192x192" href="assets/favicon.png">
    <link rel="apple-touch-icon" href="assets/favicon.png">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous">
</head>
<body class="login-page">
    <div class="login-card" style="max-width:420px;">
        <?php require __DIR__ . '/includes/login-card-brand.php'; ?>
        <h1>Sign in</h1>
        <p class="login-card__lead">Access your profile and the post dashboard.</p>
        <?php if ($error): ?>
            <div class="alert alert-error"><?php echo e($error); ?></div>
        <?php endif; ?>
        <form method="post" action="">
            <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
            <div class="form-group">
                <label for="login">Email or username</label>
                <input id="login" name="login" required autocomplete="username" value="<?php echo e($_POST['login'] ?? ''); ?>">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input id="password" name="password" type="password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Log in</button>
        </form>
        <p class="login-card__foot"><a href="forgot-password.php">Forgot password?</a></p>
        <?php if ($googleOk): ?>
            <p style="margin:1.25rem 0 0;text-align:center;color:var(--muted);font-size:0.85rem;">or</p>
            <a class="btn btn-secondary" style="width:100%;margin-top:0.75rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;" href="auth/google.php">
                <i class="fa-brands fa-google"></i> Continue with Google
            </a>
        <?php endif; ?>
        <p class="login-card__foot login-card__foot--split">No account? <a href="register.php">Register</a></p>
        <a href="index.php" class="btn btn-ghost login-card__back-site">Back to website</a>
    </div>
</body>
</html>
