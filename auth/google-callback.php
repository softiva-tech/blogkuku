<?php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/includes/functions.php';

$g = require dirname(__DIR__) . '/config/google.php';
app_session_start();

$state = $_GET['state'] ?? '';
$code = $_GET['code'] ?? '';
if ($code === '' || $state === '' || !hash_equals($_SESSION['oauth_state'] ?? '', $state)) {
    header('Location: ' . SITE_URL . '/login.php?notice=oauth');
    exit;
}
unset($_SESSION['oauth_state']);

$tokenUrl = 'https://oauth2.googleapis.com/token';
$post = [
    'code' => $code,
    'client_id' => $g['client_id'],
    'client_secret' => $g['client_secret'],
    'redirect_uri' => SITE_URL . '/auth/google-callback.php',
    'grant_type' => 'authorization_code',
];

$ch = curl_init($tokenUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($post),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
]);
$resp = curl_exec($ch);
$codeHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($resp === false || $codeHttp !== 200) {
    header('Location: ' . SITE_URL . '/login.php?notice=oauth');
    exit;
}

$data = json_decode($resp, true);
$access = $data['access_token'] ?? '';
if ($access === '') {
    header('Location: ' . SITE_URL . '/login.php?notice=oauth');
    exit;
}

$ch = curl_init('https://www.googleapis.com/oauth2/v3/userinfo');
curl_setopt_array($ch, [
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $access],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
]);
$uinfo = json_decode((string) curl_exec($ch), true);
curl_close($ch);

$googleId = $uinfo['sub'] ?? '';
$email = $uinfo['email'] ?? '';
$name = $uinfo['name'] ?? ($uinfo['given_name'] ?? 'user');
if ($googleId === '' || $email === '') {
    header('Location: ' . SITE_URL . '/login.php?notice=oauth');
    exit;
}

$st = $conn->prepare('SELECT id, username, email, role, status, password_hash, verified_at FROM users WHERE google_id = ? LIMIT 1');
$st->bind_param('s', $googleId);
$st->execute();
$row = $st->get_result()->fetch_assoc();

if (!$row) {
    $st2 = $conn->prepare('SELECT id, username, email, role, status, verified_at FROM users WHERE email = ? LIMIT 1');
    $st2->bind_param('s', $email);
    $st2->execute();
    $row = $st2->get_result()->fetch_assoc();
    if ($row) {
        $up = $conn->prepare('UPDATE users SET google_id = ? WHERE id = ?');
        $up->bind_param('si', $googleId, $row['id']);
        $up->execute();
    }
}

if (!$row) {
    $base = preg_replace('/[^a-z0-9_]/i', '', strstr($email, '@', true) ?: 'user');
    if (strlen($base) < 3) {
        $base = 'user';
    }
    $username = $base;
    $n = 1;
    while (true) {
        $c = $conn->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
        $c->bind_param('s', $username);
        $c->execute();
        if ($c->get_result()->num_rows === 0) {
            break;
        }
        $username = $base . $n;
        $n++;
    }
    $dummy = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
    $ins = $conn->prepare("INSERT INTO users (username, email, password_hash, google_id, role, status, daily_post_limit, display_name) VALUES (?, ?, ?, ?, 'member', 'active', 10, ?)");
    $ins->bind_param('sssss', $username, $email, $dummy, $googleId, $name);
    if (!$ins->execute()) {
        header('Location: ' . SITE_URL . '/login.php?notice=oauth');
        exit;
    }
    $row = [
        'id' => $ins->insert_id,
        'username' => $username,
        'email' => $email,
        'role' => 'member',
        'status' => 'active',
        'verified_at' => null,
    ];
}

if (($row['status'] ?? '') === 'blocked') {
    header('Location: ' . SITE_URL . '/login.php?notice=blocked');
    exit;
}

$full = $conn->prepare('SELECT id, username, email, role, status, verified_at FROM users WHERE id = ? LIMIT 1');
$full->bind_param('i', $row['id']);
$full->execute();
$final = $full->get_result()->fetch_assoc();
set_session_from_user($final);
$dest = SITE_URL . '/admin/index.php';
if (($final['role'] ?? '') === 'member' && empty($final['verified_at'])) {
    $dest = SITE_URL . '/admin/pending-verification.php';
}
header('Location: ' . $dest);
exit;
