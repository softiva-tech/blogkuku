/**
 * Mirrors Prisma `PostApprovalStatus` without importing `@prisma/client`.
 * Use this in `"use client"` modules — bundling Prisma in the browser breaks webpack.
 */
export const PostApprovalStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type PostApprovalStatus =
  (typeof PostApprovalStatus)[keyof typeof PostApprovalStatus];
