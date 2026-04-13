<?php

function app_session_start(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

function redirect(string $url): void
{
    header('Location: ' . $url);
    exit;
}

function csrf_token(): string
{
    app_session_start();
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function verify_csrf(?string $token): bool
{
    app_session_start();
    return is_string($token) && isset($_SESSION['_csrf']) && hash_equals($_SESSION['_csrf'], $token);
}

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-') ?: 'post';
}

function unique_category_slug(mysqli $conn, string $base, ?int $exceptId = null): string
{
    $slug = slugify($base);
    $orig = $slug;
    $n = 2;
    while (true) {
        if ($exceptId !== null) {
            $st = $conn->prepare('SELECT id FROM categories WHERE slug = ? AND id != ? LIMIT 1');
            $st->bind_param('si', $slug, $exceptId);
        } else {
            $st = $conn->prepare('SELECT id FROM categories WHERE slug = ? LIMIT 1');
            $st->bind_param('s', $slug);
        }
        $st->execute();
        if ($st->get_result()->num_rows === 0) {
            return $slug;
        }
        $slug = $orig . '-' . $n;
        $n++;
    }
}

function unique_post_slug(mysqli $conn, string $base, ?int $exceptId = null): string
{
    $slug = slugify($base);
    $orig = $slug;
    $n = 2;
    while (true) {
        if ($exceptId !== null) {
            $st = $conn->prepare('SELECT id FROM blog_posts WHERE slug = ? AND id != ? LIMIT 1');
            $st->bind_param('si', $slug, $exceptId);
        } else {
            $st = $conn->prepare('SELECT id FROM blog_posts WHERE slug = ? LIMIT 1');
            $st->bind_param('s', $slug);
        }
        $st->execute();
        if ($st->get_result()->num_rows === 0) {
            return $slug;
        }
        $slug = $orig . '-' . $n;
        $n++;
    }
}

function current_user(): ?array
{
    app_session_start();
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    return [
        'id' => (int) $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? '',
        'role' => $_SESSION['role'] ?? '',
        'email' => $_SESSION['email'] ?? '',
        'status' => $_SESSION['status'] ?? 'active',
        'verified_at' => $_SESSION['verified_at'] ?? null,
    ];
}

function require_login(): void
{
    app_session_start();
    if (empty($_SESSION['user_id'])) {
        header('Location: ' . SITE_URL . '/login.php');
        exit;
    }
}

function require_admin(): void
{
    require_login();
    if (current_user()['role'] !== 'admin') {
        header('Location: ' . SITE_URL . '/admin/index.php');
        exit;
    }
}

/** Admin, editor, or member — anyone who can access the posting dashboard. */
function require_posting_access(): void
{
    require_login();
    $r = current_user()['role'];
    if (!in_array($r, ['admin', 'editor', 'member'], true)) {
        header('Location: ' . SITE_URL . '/login.php');
        exit;
    }
}

/** Legacy alias */
function require_editor(): void
{
    require_posting_access();
}

function posts_created_today(mysqli $conn, int $userId): int
{
    $st = $conn->prepare('SELECT COUNT(*) AS c FROM blog_posts WHERE author_id = ? AND DATE(created_at) = CURDATE()');
    $st->bind_param('i', $userId);
    $st->execute();
    $row = $st->get_result()->fetch_assoc();

    return (int) ($row['c'] ?? 0);
}

/**
 * -1 = unlimited, 0 = cannot post, N = max new posts per day (all statuses count).
 */
function user_effective_daily_limit(mysqli $conn, int $userId): int
{
    $st = $conn->prepare('SELECT role, daily_post_limit FROM users WHERE id = ? LIMIT 1');
    $st->bind_param('i', $userId);
    $st->execute();
    $row = $st->get_result()->fetch_assoc();
    if (!$row) {
        return 0;
    }
    if ($row['role'] === 'admin') {
        return -1;
    }

    return (int) $row['daily_post_limit'];
}

/** Members must be approved by admin (verified_at set) before posting. */
function user_has_verified_posting_rights(mysqli $conn, int $userId): bool
{
    $st = $conn->prepare('SELECT role, verified_at FROM users WHERE id = ? LIMIT 1');
    $st->bind_param('i', $userId);
    $st->execute();
    $row = $st->get_result()->fetch_assoc();
    if (!$row) {
        return false;
    }
    $role = $row['role'] ?? '';
    if ($role === 'admin' || $role === 'editor') {
        return true;
    }
    if ($role === 'member') {
        return !empty($row['verified_at']);
    }

    return false;
}

function user_can_create_post(mysqli $conn, int $userId): bool
{
    if (!user_has_verified_posting_rights($conn, $userId)) {
        return false;
    }
    $lim = user_effective_daily_limit($conn, $userId);
    if ($lim === -1) {
        return true;
    }
    if ($lim === 0) {
        return false;
    }

    return posts_created_today($conn, $userId) < $lim;
}

function set_session_from_user(array $row): void
{
    app_session_start();
    $_SESSION['user_id'] = (int) $row['id'];
    $_SESSION['username'] = $row['username'];
    $_SESSION['email'] = $row['email'];
    $_SESSION['role'] = $row['role'];
    $_SESSION['status'] = $row['status'] ?? 'active';
    $_SESSION['verified_at'] = $row['verified_at'] ?? null;
}

function e(?string $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
}

/**
 * Convert YouTube / Vimeo URL to embed URL, or return null.
 */
function video_embed_url(?string $url): ?array
{
    $url = trim((string) $url);
    if ($url === '') {
        return null;
    }
    if (preg_match('~youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})~', $url, $m)) {
        return ['type' => 'youtube', 'src' => 'https://www.youtube-nocookie.com/embed/' . $m[1]];
    }
    if (preg_match('~youtu\.be/([a-zA-Z0-9_-]{11})~', $url, $m)) {
        return ['type' => 'youtube', 'src' => 'https://www.youtube-nocookie.com/embed/' . $m[1]];
    }
    if (preg_match('~youtube\.com/embed/([a-zA-Z0-9_-]{11})~', $url, $m)) {
        return ['type' => 'youtube', 'src' => 'https://www.youtube-nocookie.com/embed/' . $m[1]];
    }
    if (preg_match('~youtube\.com/shorts/([a-zA-Z0-9_-]{11})~', $url, $m)) {
        return ['type' => 'youtube', 'src' => 'https://www.youtube-nocookie.com/embed/' . $m[1]];
    }
    if (preg_match('~vimeo\.com/(?:video/)?(\d+)~', $url, $m)) {
        return ['type' => 'vimeo', 'src' => 'https://player.vimeo.com/video/' . $m[1]];
    }

    return null;
}
