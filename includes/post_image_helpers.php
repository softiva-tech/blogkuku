<?php

/**
 * @return array{ok:bool, path?:string, error?:string}
 */
function save_post_featured_upload(array $file): array
{
    if (empty($file['tmp_name']) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return ['ok' => true];
    }

    $errCode = (int) ($file['error'] ?? UPLOAD_ERR_OK);
    if ($errCode !== UPLOAD_ERR_OK) {
        $uploadErrors = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds server upload_max_filesize.',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds form limit.',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Server has no temporary folder for uploads (check upload_tmp_dir).',
            UPLOAD_ERR_CANT_WRITE => 'Server could not write the uploaded file to disk.',
            UPLOAD_ERR_EXTENSION => 'A PHP extension blocked the upload.',
        ];
        $msg = $uploadErrors[$errCode] ?? 'Image upload failed (error ' . $errCode . ').';

        return ['ok' => false, 'error' => $msg];
    }

    if (($file['size'] ?? 0) > 5 * 1024 * 1024) {
        return ['ok' => false, 'error' => 'Image must be 5MB or smaller.'];
    }

    $tmp = $file['tmp_name'];
    if (!is_uploaded_file($tmp)) {
        return ['ok' => false, 'error' => 'Upload not accepted by the server (not a valid uploaded file). Check PHP upload_tmp_dir and open_basedir.'];
    }

    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($tmp);
    } else {
        $info = @getimagesize($tmp);
        if ($info === false || empty($info['mime'])) {
            return ['ok' => false, 'error' => 'Invalid image file.'];
        }
        $mime = $info['mime'];
    }
    $map = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];
    if (!isset($map[$mime])) {
        return ['ok' => false, 'error' => 'Use JPEG, PNG, WebP, or GIF.'];
    }
    $ext = $map[$mime];

    $root = realpath(KUKUWEB_ROOT);
    if ($root === false || !is_dir($root)) {
        return ['ok' => false, 'error' => 'Site root path is invalid (KUKUWEB_ROOT).'];
    }

    $dir = $root . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'posts';
    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0775, true) && !is_dir($dir)) {
            return ['ok' => false, 'error' => 'Could not create uploads/posts. Create it manually and chmod 775 (or 777 for local XAMPP).'];
        }
    }
    @chmod($dir, 0775);
    if (!is_writable($dir)) {
        return [
            'ok' => false,
            'error' => 'Folder uploads/posts is not writable by the web server. On XAMPP/macOS run: chmod -R 775 ' . $dir . ' (or chown to the Apache user).',
        ];
    }

    $name = bin2hex(random_bytes(16)) . '.' . $ext;
    $destFs = $dir . DIRECTORY_SEPARATOR . $name;

    if (is_uploaded_file($tmp) && @move_uploaded_file($tmp, $destFs)) {
        return ['ok' => true, 'path' => 'uploads/posts/' . $name];
    }

    // Cross-volume or rare hosts: copy then remove temp (only while still an uploaded file)
    if (is_uploaded_file($tmp) && @copy($tmp, $destFs)) {
        @unlink($tmp);

        return ['ok' => true, 'path' => 'uploads/posts/' . $name];
    }

    return [
        'ok' => false,
        'error' => 'Could not save image into uploads/posts. Fix folder permissions (writable by Apache/_www/daemon) or disk space.',
    ];
}

function delete_post_image_file(?string $relative): void
{
    if ($relative === null || $relative === '') {
        return;
    }
    $relative = str_replace(['..', '\\'], ['', '/'], $relative);
    if (strpos($relative, 'uploads/posts/') !== 0) {
        return;
    }
    $full = KUKUWEB_ROOT . '/' . $relative;
    if (is_file($full)) {
        @unlink($full);
    }
}
