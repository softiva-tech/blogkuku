<?php

if (!defined('SITE_URL')) {
    $u = getenv('KUKUWEB_SITE_URL') ?: 'http://localhost/Kukuweb';
    define('SITE_URL', rtrim($u, '/'));
}
