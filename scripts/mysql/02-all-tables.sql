-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `blocked` BOOLEAN NOT NULL DEFAULT false,
    `blockedReason` VARCHAR(191) NULL,
    `writerApproved` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'site',
    `dailyPostLimitEnabled` BOOLEAN NOT NULL DEFAULT false,
    `dailyPostLimitCount` INTEGER NOT NULL DEFAULT 3,
    `paymentAdsEnabled` BOOLEAN NOT NULL DEFAULT false,
    `paymentSubscriptionsEnabled` BOOLEAN NOT NULL DEFAULT false,
    `paymentStripeEnabled` BOOLEAN NOT NULL DEFAULT false,
    `paymentRazorpayEnabled` BOOLEAN NOT NULL DEFAULT false,
    `paymentGooglePayEnabled` BOOLEAN NOT NULL DEFAULT false,
    `paymentPaytmEnabled` BOOLEAN NOT NULL DEFAULT false,
    `paymentPayPhoneEnabled` BOOLEAN NOT NULL DEFAULT false,
    `paymentPayPalEnabled` BOOLEAN NOT NULL DEFAULT false,
    `promoMetaTitle` VARCHAR(200) NULL,
    `promoMetaDescription` TEXT NULL,
    `promoKeywords` VARCHAR(500) NULL,
    `promoOgImageUrl` VARCHAR(2048) NULL,
    `socialFacebookUrl` VARCHAR(500) NULL,
    `socialInstagramUrl` VARCHAR(500) NULL,
    `socialWhatsAppUrl` VARCHAR(500) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImpersonationToken` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ImpersonationToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `coverImageUrl` VARCHAR(2048) NULL,
    `coverImageKind` ENUM('NONE', 'EXTERNAL', 'UPLOAD') NOT NULL DEFAULT 'NONE',
    `youtubeUrl` VARCHAR(512) NULL,
    `approvalStatus` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `authorId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Post_slug_key`(`slug`),
    INDEX `Post_approvalStatus_createdAt_idx`(`approvalStatus`, `createdAt`),
    INDEX `Post_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT true,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Comment_postId_approved_idx`(`postId`, `approved`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ImpersonationToken` ADD CONSTRAINT `ImpersonationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

