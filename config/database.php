<?php
/**
 * MySQL connection — adjust credentials for your XAMPP environment.
 */
$DB_HOST = getenv('KUKUWEB_DB_HOST') ?: 'localhost';
$DB_USER = getenv('KUKUWEB_DB_USER') ?: 'root';
$DB_PASS = getenv('KUKUWEB_DB_PASS') ?: '';
$DB_NAME = getenv('KUKUWEB_DB_NAME') ?: 'kukuweb_blog';

if (!defined('KUKUWEB_ROOT')) {
    define('KUKUWEB_ROOT', dirname(__DIR__));
}

require_once __DIR__ . '/app.php';

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($conn->connect_error) {
    die('Database connection failed. Open setup.php in your browser once, or edit config/database.php credentials.');
}
$conn->set_charset('utf8mb4');

$col = @$conn->query("SHOW COLUMNS FROM blog_posts LIKE 'featured_image'");
if ($col && $col->num_rows === 0) {
    @$conn->query('ALTER TABLE blog_posts ADD COLUMN featured_image VARCHAR(500) NULL AFTER video_url');
}

/* Users table extensions (registration, OAuth, limits, block) */
$t = @$conn->query("SHOW TABLES LIKE 'users'");
if ($t && $t->num_rows > 0) {
    $addCol = function (string $name, string $ddl) use ($conn) {
        $c = @$conn->query("SHOW COLUMNS FROM users LIKE '" . $conn->real_escape_string($name) . "'");
        if ($c && $c->num_rows === 0) {
            @$conn->query($ddl);
        }
    };
    $addCol('display_name', 'ALTER TABLE users ADD COLUMN display_name VARCHAR(120) NULL AFTER username');
    $addCol('bio', 'ALTER TABLE users ADD COLUMN bio TEXT NULL AFTER display_name');
    $addCol('status', "ALTER TABLE users ADD COLUMN status ENUM('active','blocked') NOT NULL DEFAULT 'active' AFTER role");
    $addCol('daily_post_limit', "ALTER TABLE users ADD COLUMN daily_post_limit INT NOT NULL DEFAULT 10 AFTER status");
    $addCol('google_id', 'ALTER TABLE users ADD COLUMN google_id VARCHAR(191) NULL UNIQUE AFTER email');
    $addCol('password_reset_token', 'ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(64) NULL');
    $addCol('password_reset_expires', 'ALTER TABLE users ADD COLUMN password_reset_expires DATETIME NULL');
    $addCol('verified_at', 'ALTER TABLE users ADD COLUMN verified_at DATETIME NULL AFTER daily_post_limit');

    @$conn->query("ALTER TABLE users MODIFY role ENUM('admin','editor','member') NOT NULL DEFAULT 'member'");

    @$conn->query("UPDATE users SET daily_post_limit = -1 WHERE role IN ('admin','editor') AND daily_post_limit = 10");
}

@$conn->query("CREATE TABLE IF NOT EXISTS schema_migrations (
  migration_key VARCHAR(64) NOT NULL PRIMARY KEY,
  ran_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

$mg = @$conn->query("SELECT 1 FROM schema_migrations WHERE migration_key = 'v1_user_verified_grandfather' LIMIT 1");
if ($mg && $mg->num_rows === 0) {
    @$conn->query('UPDATE users SET verified_at = created_at WHERE verified_at IS NULL');
    @$conn->query("INSERT INTO schema_migrations (migration_key) VALUES ('v1_user_verified_grandfather')");
}

/* Categories table + blog_posts.category_id */
$tc = @$conn->query("SHOW TABLES LIKE 'categories'");
if ($tc && $tc->num_rows === 0) {
    @$conn->query("CREATE TABLE categories (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(130) NOT NULL UNIQUE,
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

$c2 = @$conn->query("SHOW COLUMNS FROM blog_posts LIKE 'category_id'");
if ($c2 && $c2->num_rows === 0) {
    @$conn->query('ALTER TABLE blog_posts ADD COLUMN category_id INT UNSIGNED NULL AFTER category');
    @$conn->query('ALTER TABLE blog_posts ADD CONSTRAINT fk_blog_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL');
}

$tc3 = @$conn->query("SHOW TABLES LIKE 'categories'");
if ($tc3 && $tc3->num_rows > 0) {
    $n = (int) (@$conn->query('SELECT COUNT(*) AS c FROM categories')->fetch_assoc()['c'] ?? 0);
    if ($n === 0) {
        @$conn->query("INSERT INTO categories (name, slug, sort_order) VALUES ('General', 'general', 0)");
    }
    $res = @$conn->query("SELECT DISTINCT TRIM(category) AS cat FROM blog_posts WHERE category IS NOT NULL AND TRIM(category) != ''");
    if ($res && $res->num_rows > 0) {
        require_once dirname(__DIR__) . '/includes/functions.php';
        while ($row = $res->fetch_assoc()) {
            $name = $row['cat'];
            $slug = slugify($name);
            if ($slug === '') {
                $slug = 'category';
            }
            $orig = $slug;
            $k = 2;
            $cid = null;
            $chkN = $conn->prepare('SELECT id FROM categories WHERE name = ? LIMIT 1');
            $chkN->bind_param('s', $name);
            $chkN->execute();
            $byName = $chkN->get_result()->fetch_assoc();
            if ($byName) {
                $cid = (int) $byName['id'];
            } else {
                while (true) {
                    $chkS = $conn->prepare('SELECT id FROM categories WHERE slug = ? LIMIT 1');
                    $chkS->bind_param('s', $slug);
                    $chkS->execute();
                    $bySlug = $chkS->get_result()->fetch_assoc();
                    if ($bySlug) {
                        $cid = (int) $bySlug['id'];
                        break;
                    }
                    $ins = $conn->prepare('INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, 0)');
                    $ins->bind_param('ss', $name, $slug);
                    if ($ins->execute()) {
                        $cid = (int) $conn->insert_id;
                        break;
                    }
                    if ((int) $conn->errno === 1062) {
                        $slug = $orig . '-' . $k;
                        $k++;
                    } else {
                        break;
                    }
                }
            }
            if ($cid !== null) {
                $up = $conn->prepare('UPDATE blog_posts SET category_id = ? WHERE TRIM(category) = ? AND (category_id IS NULL OR category_id = 0)');
                $up->bind_param('is', $cid, $name);
                $up->execute();
            }
        }
    }
    $gen = @$conn->query("SELECT id FROM categories WHERE slug = 'general' LIMIT 1")->fetch_assoc();
    if ($gen) {
        $gid = (int) $gen['id'];
        @$conn->query("UPDATE blog_posts SET category_id = {$gid} WHERE category_id IS NULL");
    }
}
