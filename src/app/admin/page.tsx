import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostApprovalStatus } from "@prisma/client";
import { enabledPaymentGatewayLabels } from "@/lib/payment-gateways";

export default async function AdminHomePage() {
  const [posts, users, commentsPending, pendingPosts, categories, siteSettings] =
    await Promise.all([
      prisma.post.count(),
      prisma.user.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.post.count({ where: { approvalStatus: PostApprovalStatus.PENDING } }),
      prisma.category.count(),
      prisma.siteSettings.findUnique({ where: { id: "site" } }),
    ]);

  const gatewayLabels = siteSettings
    ? enabledPaymentGatewayLabels(siteSettings)
    : [];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-50">Dashboard</h1>
      <p className="mt-2 text-sm text-ink-400">
        Approvals, categories, payments toggles, and user controls.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-5">
          <p className="text-3xl font-display text-ink-50">{posts}</p>
          <p className="text-sm text-ink-400">Total posts</p>
          <Link
            href="/admin/posts"
            className="mt-3 inline-block text-sm text-ember-500 hover:underline"
          >
            Manage posts →
          </Link>
        </div>
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-5">
          <p className="text-3xl font-display text-amber-200">{pendingPosts}</p>
          <p className="text-sm text-ink-400">Pending approval</p>
          <Link
            href="/admin/posts"
            className="mt-3 inline-block text-sm text-ember-500 hover:underline"
          >
            Review queue →
          </Link>
        </div>
        <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-5">
          <p className="text-3xl font-display text-ink-50">{categories}</p>
          <p className="text-sm text-ink-400">Categories</p>
          <Link
            href="/admin/categories"
            className="mt-3 inline-block text-sm text-ember-500 hover:underline"
          >
            Manage categories →
          </Link>
        </div>
        <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-5">
          <p className="text-3xl font-display text-ink-50">{users}</p>
          <p className="text-sm text-ink-400">Registered users</p>
          <Link
            href="/admin/users"
            className="mt-3 inline-block text-sm text-ember-500 hover:underline"
          >
            Manage users →
          </Link>
        </div>
        <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-5">
          <p className="text-3xl font-display text-ink-50">{commentsPending}</p>
          <p className="text-sm text-ink-400">Hidden comments</p>
          <Link
            href="/admin/comments"
            className="mt-3 inline-block text-sm text-ember-500 hover:underline"
          >
            Moderate →
          </Link>
        </div>
        <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-5">
          <p className="font-display text-lg text-ink-50">Payments</p>
          <p className="mt-1 text-sm text-ink-400">
            Gateways on:{" "}
            {gatewayLabels.length > 0 ? gatewayLabels.join(", ") : "none yet"}
          </p>
          <Link
            href="/admin/settings"
            className="mt-3 inline-block text-sm text-ember-500 hover:underline"
          >
            Open settings →
          </Link>
        </div>
      </div>
    </div>
  );
}
