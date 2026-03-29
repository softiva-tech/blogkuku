-- Optional social profile URLs on SiteSettings (footer + admin).

ALTER TABLE `SiteSettings` ADD COLUMN IF NOT EXISTS `socialFacebookUrl` VARCHAR(500) NULL;
ALTER TABLE `SiteSettings` ADD COLUMN IF NOT EXISTS `socialInstagramUrl` VARCHAR(500) NULL;
ALTER TABLE `SiteSettings` ADD COLUMN IF NOT EXISTS `socialWhatsAppUrl` VARCHAR(500) NULL;
