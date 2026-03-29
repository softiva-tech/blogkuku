-- =============================================================================
-- Chronicle blog — MySQL database (matches DATABASE_URL in .env)
-- =============================================================================
-- XAMPP: open http://localhost/phpmyadmin → SQL tab → paste → Go
-- CLI (no password): mysql -h 127.0.0.1 -u root < scripts/mysql/01-create-database.sql
-- CLI (with password): mysql -h 127.0.0.1 -u root -p < scripts/mysql/01-create-database.sql
--
-- After this succeeds, from the project root run:
--   npx prisma db push
--   npm run db:seed
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `blogkuku`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
