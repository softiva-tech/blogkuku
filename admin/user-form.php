<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_admin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$user = null;
if ($id > 0) {
    $st = $conn->prepare('SELECT id, username, email, role, status, daily_post_limit, display_name, verified_at FROM users WHERE id = ? LIMIT 1');
    $st->bind_param('i', $id);
    $st->execute();
    $user = $st->get_result()->fetch_assoc();
    if (!$user) {
        redirect('users.php');
    }
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['_csrf'] ?? '')) {
        $error = 'Invalid session.';
    } else {
        $username = trim((string) ($_POST['username'] ?? ''));
        $email = trim((string) ($_POST['email'] ?? ''));
        $role = (string) ($_POST['role'] ?? 'member');
        if (!in_array($role, ['admin', 'editor', 'member'], true)) {
            $role = 'member';
        }
        $status = ($_POST['status'] ?? '') === 'blocked' ? 'blocked' : 'active';
        $daily_post_limit = (int) ($_POST['daily_post_limit'] ?? 10);
        if ($daily_post_limit < -1) {
            $daily_post_limit = -1;
        }
        $password = (string) ($_POST['password'] ?? '');
        $password2 = (string) ($_POST['password2'] ?? '');

        if ($username === '' || $email === '') {
            $error = 'Username and email are required.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Invalid email.';
        } elseif ($id === 0 && strlen($password) < 8) {
            $error = 'Password must be at least 8 characters for new users.';
        } elseif ($password !== '' && $password !== $password2) {
            $error = 'Passwords do not match.';
        } elseif ($password !== '' && strlen($password) < 8) {
            $error = 'Password must be at least 8 characters.';
        } else {
            if ($id > 0) {
                $chk = $conn->prepare('SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1');
                $chk->bind_param('si', $username, $id);
            } else {
                $chk = $conn->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
                $chk->bind_param('s', $username);
            }
            $chk->execute();
            if ($chk->get_result()->num_rows > 0) {
                $error = 'Username already taken.';
            } else {
                if ($id > 0) {
                    $chk2 = $conn->prepare('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1');
                    $chk2->bind_param('si', $email, $id);
                } else {
                    $chk2 = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
                    $chk2->bind_param('s', $email);
                }
                $chk2->execute();
                if ($chk2->get_result()->num_rows > 0) {
                    $error = 'Email already in use.';
                }
            }
        }

        if ($error === '') {
            if ($role === 'admin') {
                $daily_post_limit = -1;
            }

            if ($id > 0) {
                if ($password !== '') {
                    $hash = password_hash($password, PASSWORD_DEFAULT);
                    $stmt = $conn->prepare('UPDATE users SET username=?, email=?, role=?, status=?, daily_post_limit=?, password_hash=? WHERE id=?');
                    $stmt->bind_param('ssssisi', $username, $email, $role, $status, $daily_post_limit, $hash, $id);
                } else {
                    $stmt = $conn->prepare('UPDATE users SET username=?, email=?, role=?, status=?, daily_post_limit=? WHERE id=?');
                    $stmt->bind_param('ssssii', $username, $email, $role, $status, $daily_post_limit, $id);
                }
                if ($stmt->execute()) {
                    if ((int) $id === (int) current_user()['id']) {
                        $_SESSION['username'] = $username;
                        $_SESSION['email'] = $email;
                        $_SESSION['role'] = $role;
                        $_SESSION['status'] = $status;
                    }
                    $success = 'User updated.';
                    $st = $conn->prepare('SELECT id, username, email, role, status, daily_post_limit, display_name, verified_at FROM users WHERE id = ?');
                    $st->bind_param('i', $id);
                    $st->execute();
                    $user = $st->get_result()->fetch_assoc();
                } else {
                    $error = 'Could not update user.';
                }
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $conn->prepare('INSERT INTO users (username, email, password_hash, role, status, daily_post_limit) VALUES (?,?,?,?,?,?)');
                $stmt->bind_param('sssssi', $username, $email, $hash, $role, $status, $daily_post_limit);
                if ($stmt->execute()) {
                    redirect('user-form.php?id=' . $stmt->insert_id);
                }
                $error = 'Could not create user.';
            }
        }
    }
}

$page_title = $user ? 'Edit user' : 'New user';
include __DIR__ . '/includes/layout-start.php';

$v = $user ?? ['username' => '', 'email' => '', 'role' => 'member', 'status' => 'active', 'daily_post_limit' => 10];
?>

<div class="admin-top">
    <h1><?php echo $user ? 'Edit user' : 'New user'; ?></h1>
    <a href="users.php" class="btn btn-secondary">Back to list</a>
</div>

<?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
<?php if ($success): ?><div class="alert alert-success"><?php echo e($success); ?></div><?php endif; ?>

<div class="form-card">
    <form method="post" action="">
        <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
        <div class="form-group">
            <label for="username">Username</label>
            <input id="username" name="username" required autocomplete="username" value="<?php echo e($v['username']); ?>">
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" required value="<?php echo e($v['email']); ?>">
        </div>
        <div class="form-group">
            <label for="role">Role</label>
            <select id="role" name="role">
                <option value="member" <?php echo ($v['role'] ?? '') === 'member' ? 'selected' : ''; ?>>Member (posts + daily limit)</option>
                <option value="editor" <?php echo ($v['role'] ?? '') === 'editor' ? 'selected' : ''; ?>>Editor (posts, unlimited by default)</option>
                <option value="admin" <?php echo ($v['role'] ?? '') === 'admin' ? 'selected' : ''; ?>>Admin</option>
            </select>
        </div>
        <div class="form-group">
            <label for="status">Status</label>
            <select id="status" name="status">
                <option value="active" <?php echo ($v['status'] ?? '') === 'active' ? 'selected' : ''; ?>>Active</option>
                <option value="blocked" <?php echo ($v['status'] ?? '') === 'blocked' ? 'selected' : ''; ?>>Blocked (cannot sign in)</option>
            </select>
        </div>
        <div class="form-group">
            <label for="daily_post_limit">Daily post limit</label>
            <input id="daily_post_limit" name="daily_post_limit" type="number" min="-1" value="<?php echo (int) ($v['daily_post_limit'] ?? 10); ?>">
            <p class="form-hint">-1 = unlimited · 0 = cannot create posts · N = max new posts per calendar day (drafts count). Admins always unlimited.</p>
        </div>
        <?php if ($user && (($user['role'] ?? '') === 'member')): ?>
            <div class="form-group">
                <label>Posting approval</label>
                <p class="form-hint" style="margin:0;">
                    <?php if (!empty($user['verified_at'])): ?>
                        Approved <?php echo e($user['verified_at']); ?>. Use the Users list to revoke approval if needed.
                    <?php else: ?>
                        Pending — an admin must approve this member before they can create posts.
                    <?php endif; ?>
                </p>
            </div>
        <?php endif; ?>
        <div class="form-group">
            <label for="password">Password <?php echo $user ? '(leave blank to keep)' : ''; ?></label>
            <input id="password" name="password" type="password" autocomplete="new-password" <?php echo $user ? '' : 'required'; ?>>
        </div>
        <div class="form-group">
            <label for="password2">Confirm password</label>
            <input id="password2" name="password2" type="password" autocomplete="new-password" <?php echo $user ? '' : 'required'; ?>>
        </div>
        <button type="submit" class="btn btn-primary">Save</button>
    </form>
</div>

<?php include __DIR__ . '/includes/layout-end.php'; ?>
