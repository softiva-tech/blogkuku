-- Payment processor toggles on SiteSettings (skip if using a fresh 02-all-tables.sql).
-- MariaDB / XAMPP: IF NOT EXISTS avoids errors when re-running.
-- If you use Oracle MySQL < 8.0.29, run each plain ADD COLUMN and ignore "Duplicate column" errors.

ALTER TABLE `SiteSettings` ADD COLUMN IF NOT EXISTS `paymentStripeEnabled` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `SiteSettings` ADD COLUMN IF NOT EXISTS `paymentRazorpayEnabled` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `SiteSettings` ADD COLUMN IF NOT EXISTS `paymentGooglePayEnabled` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `SiteSettings` ADD COLUMN IF NOT EXISTS `paymentPaytmEnabled` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `SiteSettings` ADD COLUMN IF NOT EXISTS `paymentPayPhoneEnabled` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `SiteSettings` ADD COLUMN IF NOT EXISTS `paymentPayPalEnabled` BOOLEAN NOT NULL DEFAULT false;
