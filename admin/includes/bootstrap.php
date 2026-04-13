<?php
$_root = dirname(dirname(__DIR__));
require_once $_root . '/config/database.php';
require_once $_root . '/includes/functions.php';
require_once $_root . '/includes/session_sync.php';
app_session_start();
sync_session_with_db($conn);
