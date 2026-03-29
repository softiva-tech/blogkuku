-- New signups are created with writerApproved = false from the app.
-- DEFAULT true keeps existing accounts able to submit until you review them.

ALTER TABLE `User`
ADD COLUMN `writerApproved` BOOLEAN NOT NULL DEFAULT true;
