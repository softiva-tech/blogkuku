-- Run against an existing database that was created with 02-all-tables.sql (before coverImageKind).
-- Safe to skip if you use a fresh `02-all-tables.sql` that already includes this column.

ALTER TABLE `Post`
ADD COLUMN `coverImageKind` ENUM('NONE', 'EXTERNAL', 'UPLOAD') NOT NULL DEFAULT 'NONE';

UPDATE `Post`
SET `coverImageKind` = 'EXTERNAL'
WHERE `coverImageUrl` IS NOT NULL
  AND `coverImageUrl` NOT LIKE '/uploads/posts/%';

UPDATE `Post`
SET `coverImageKind` = 'UPLOAD'
WHERE `coverImageUrl` LIKE '/uploads/posts/%';
