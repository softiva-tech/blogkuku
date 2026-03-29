-- Admin-editable SEO / social fields on SiteSettings (skip if you use a fresh 02-all-tables.sql).

ALTER TABLE `SiteSettings` ADD COLUMN `promoMetaTitle` VARCHAR(200) NULL;
ALTER TABLE `SiteSettings` ADD COLUMN `promoMetaDescription` TEXT NULL;
ALTER TABLE `SiteSettings` ADD COLUMN `promoKeywords` VARCHAR(500) NULL;
ALTER TABLE `SiteSettings` ADD COLUMN `promoOgImageUrl` VARCHAR(2048) NULL;
