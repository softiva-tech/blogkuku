<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';
app_session_start();

if (current_user()) {
    header('Location: ' . SITE_URL . '/admin/index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['_csrf'] ?? '')) {
        $error = 'Invalid session.';
    } else {
        $username = trim((string) ($_POST['username'] ?? ''));
        $email = trim((string) ($_POST['email'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        $password2 = (string) ($_POST['password2'] ?? '');

        if ($username === '' || $email === '' || strlen($password) < 8) {
            $error = 'Username, email, and password (8+ chars) are required.';
        } elseif ($password !== $password2) {
            $error = 'Passwords do not match.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Invalid email.';
        } elseif (!preg_match('/^[a-zA-Z0-9_]{3,40}$/', $username)) {
            $error = 'Username: 3–40 letters, numbers, underscores.';
        } else {
            $c1 = $conn->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
            $c1->bind_param('s', $username);
            $c1->execute();
            if ($c1->get_result()->num_rows > 0) {
                $error = 'Username taken.';
            } else {
                $c2 = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
                $c2->bind_param('s', $email);
                $c2->execute();
                if ($c2->get_result()->num_rows > 0) {
                    $error = 'Email already registered.';
                }
            }
        }

        if ($error === '') {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $st = $conn->prepare("INSERT INTO users (username, email, password_hash, role, status, daily_post_limit, display_name) VALUES (?, ?, ?, 'member', 'active', 10, ?)");
            $disp = $username;
            $st->bind_param('ssss', $username, $email, $hash, $disp);
            if ($st->execute()) {
                $id = $st->insert_id;
                $row = [
                    'id' => $id,
                    'username' => $username,
                    'email' => $email,
                    'role' => 'member',
                    'status' => 'active',
                    'verified_at' => null,
                ];
                set_session_from_user($row);
                header('Location: ' . SITE_URL . '/admin/pending-verification.php');
                exit;
            }
            $error = 'Registration failed.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register — Never Quit Punjabi</title>
    <meta name="theme-color" content="#000000">
    <link rel="icon" type="image/png" sizes="192x192" href="assets/favicon.png">
    <link rel="apple-touch-icon" href="assets/favicon.png">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="login-page">
    <div class="login-card" style="max-width:420px;">
        <?php require __DIR__ . '/includes/login-card-brand.php'; ?>
        <h1>Create account</h1>
        <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
        <form method="post">
            <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
            <div class="form-group">
                <label for="username">Username</label>
                <input id="username" name="username" required pattern="[a-zA-Z0-9_]{3,40}" value="<?php echo e($_POST['username'] ?? ''); ?>">
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" required value="<?php echo e($_POST['email'] ?? ''); ?>">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input id="password" name="password" type="password" required minlength="8">
            </div>
            <div class="form-group">
                <label for="password2">Confirm password</label>
                <input id="password2" name="password2" type="password" required minlength="8">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Register</button>
        </form>
        <p class="login-card__foot"><a href="login.php">Already have an account? Sign in</a></p>
        <a href="index.php" class="btn btn-ghost login-card__back-site">Back to website</a>
    </div>
</body>
</html>
