-- Optional manual import (or use setup.php)
CREATE DATABASE IF NOT EXISTS kukuweb_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kukuweb_blog;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_posts_status_published ON blog_posts (status, published_at DESC);
CREATE INDEX idx_posts_category ON blog_posts (category);
