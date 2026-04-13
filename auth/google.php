<?php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/includes/functions.php';

$g = require dirname(__DIR__) . '/config/google.php';
if ($g['client_id'] === '' || $g['client_secret'] === '') {
    header('Location: ' . SITE_URL . '/login.php');
    exit;
}

app_session_start();
$_SESSION['oauth_state'] = bin2hex(random_bytes(16));

$params = [
    'client_id' => $g['client_id'],
    'redirect_uri' => SITE_URL . '/auth/google-callback.php',
    'response_type' => 'code',
    'scope' => 'openid email profile',
    'state' => $_SESSION['oauth_state'],
    'access_type' => 'online',
    'prompt' => 'select_account',
];
$url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
header('Location: ' . $url);
exit;
