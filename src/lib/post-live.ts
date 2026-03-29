import { PostApprovalStatus } from "@prisma/client";

/** Posts visible on public blog and commentable */
export const publicPostWhere = {
  approvalStatus: PostApprovalStatus.APPROVED,
} as const;
