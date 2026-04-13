<?php

/**
 * Keep session aligned with DB; kick blocked users.
 */
function sync_session_with_db(mysqli $conn): void
{
    app_session_start();
    if (empty($_SESSION['user_id'])) {
        return;
    }
    $id = (int) $_SESSION['user_id'];
    $st = $conn->prepare('SELECT id, username, email, role, status, verified_at FROM users WHERE id = ? LIMIT 1');
    $st->bind_param('i', $id);
    $st->execute();
    $row = $st->get_result()->fetch_assoc();
    if (!$row || ($row['status'] ?? '') === 'blocked') {
        $_SESSION = [];
        session_destroy();
        $to = SITE_URL . '/login.php?notice=blocked';
        header('Location: ' . $to);
        exit;
    }
    $_SESSION['username'] = $row['username'];
    $_SESSION['email'] = $row['email'];
    $_SESSION['role'] = $row['role'];
    $_SESSION['status'] = $row['status'];
    $_SESSION['verified_at'] = $row['verified_at'] ?? null;
}
