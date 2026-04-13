<?php

function send_plain_mail(string $to, string $subject, string $body): bool
{
    $host = parse_url(SITE_URL, PHP_URL_HOST) ?: 'localhost';
    $from = 'noreply@' . $host;
    $headers = 'From: ' . $from . "\r\n" . 'Content-Type: text/plain; charset=UTF-8';

    return @mail($to, $subject, $body, $headers);
}
