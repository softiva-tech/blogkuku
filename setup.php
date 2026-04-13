<?php
/**
 * One-time installer: open in browser once, then delete this file.
 * http://localhost/Kukuweb/setup.php
 */
$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'kukuweb_blog';

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS);
if ($conn->connect_error) {
    die('MySQL connection failed: ' . $conn->connect_error);
}
$conn->set_charset('utf8mb4');

if (!$conn->query("CREATE DATABASE IF NOT EXISTS `$DB_NAME` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")) {
    die('Could not create database: ' . $conn->error);
}
$conn->select_db($DB_NAME);

$usersTable = <<<'SQL'
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  display_name VARCHAR(120) NULL,
  bio TEXT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  google_id VARCHAR(191) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','editor','member') NOT NULL DEFAULT 'member',
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  daily_post_limit INT NOT NULL DEFAULT 10,
  password_reset_token VARCHAR(64) NULL,
  password_reset_expires DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL;

$postsTable = <<<'SQL'
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NULL,
  content LONGTEXT NOT NULL,
  video_url VARCHAR(500) NULL,
  featured_image VARCHAR(500) NULL,
  category VARCHAR(100) NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  author_id INT UNSIGNED NOT NULL,
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL;

if (!$conn->query($usersTable)) {
    die('users table: ' . $conn->error);
}
if (!$conn->query($postsTable)) {
    die('blog_posts table: ' . $conn->error);
}

@$conn->query('CREATE INDEX idx_posts_status_published ON blog_posts (status, published_at DESC)');
@$conn->query('CREATE INDEX idx_posts_category ON blog_posts (category)');

$res = $conn->query('SELECT COUNT(*) AS c FROM users');
$row = $res->fetch_assoc();
if ((int) $row['c'] === 0) {
    $hash = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, role, status, daily_post_limit) VALUES ('admin', 'admin@localhost', ?, 'admin', 'active', -1)");
    $stmt->bind_param('s', $hash);
    $stmt->execute();
    $msg = 'Database ready. Default login: admin / admin123 — change this password after first login.';
} else {
    $msg = 'Database already initialized. No new admin user created.';
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Never Quit Punjabi — setup</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 1rem; line-height: 1.5; }
        .ok { color: #0a0; }
    </style>
</head>
<body>
    <h1>Setup complete</h1>
    <p class="ok"><?php echo htmlspecialchars($msg); ?></p>
    <p><strong>Delete setup.php</strong> from the server when finished.</p>
    <p><a href="index.php">Home</a> · <a href="admin/login.php">Admin login</a></p>
</body>
</html>
