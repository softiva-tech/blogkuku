import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost, setPostApprovalStatus } from "@/lib/actions";
import { PostApprovalStatus } from "@prisma/client";

function statusStyle(s: PostApprovalStatus) {
  switch (s) {
    case PostApprovalStatus.APPROVED:
      return "text-emerald-400";
    case PostApprovalStatus.PENDING:
      return "text-amber-300";
    case PostApprovalStatus.REJECTED:
      return "text-red-400";
    default:
      return "text-ink-500";
  }
}

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { email: true, name: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-50">Posts</h1>
          <p className="mt-1 text-sm text-ink-400">
            Approve submissions, edit media, manage categories.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-ember-500 px-5 py-2 text-sm font-semibold text-white hover:bg-ember-600"
        >
          New post
        </Link>
      </div>
      <ul className="mt-10 divide-y divide-ink-800 border-t border-ink-800">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/posts/${post.id}/edit`}
                className="font-medium text-ink-100 hover:text-ember-500"
              >
                {post.title}
              </Link>
              <p className={`mt-1 text-xs ${statusStyle(post.approvalStatus)}`}>
                {post.approvalStatus}
                {post.category ? ` · ${post.category.name}` : ""} · /blog/
                {post.slug} · {post.author.name || post.author.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {post.approvalStatus === PostApprovalStatus.PENDING ? (
                  <>
                    <form
                      action={setPostApprovalStatus.bind(
                        null,
                        post.id,
                        PostApprovalStatus.APPROVED,
                      ) as unknown as (fd: FormData) => void | Promise<void>}
                    >
                      <button
                        type="submit"
                        className="rounded-md bg-emerald-950/60 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900/60"
                      >
                        Approve
                      </button>
                    </form>
                    <form
                      action={setPostApprovalStatus.bind(
                        null,
                        post.id,
                        PostApprovalStatus.REJECTED,
                      ) as unknown as (fd: FormData) => void | Promise<void>}
                    >
                      <button
                        type="submit"
                        className="rounded-md bg-red-950/50 px-2 py-1 text-xs text-red-200 hover:bg-red-900/50"
                      >
                        Reject
                      </button>
                    </form>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.approvalStatus === PostApprovalStatus.APPROVED ? (
                <Link
                  href={`/blog/${post.slug}`}
                  className="rounded-md border border-ink-700 px-3 py-1.5 text-xs text-ink-300 hover:border-ember-500/50"
                >
                  View live
                </Link>
              ) : null}
              <form
                action={
                  deletePost.bind(null, post.id) as unknown as (
                    fd: FormData,
                  ) => void | Promise<void>
                }
              >
                <button
                  type="submit"
                  className="rounded-md border border-red-900/60 bg-red-950/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-950/50"
                >
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-ink-500">No posts yet.</p>
      ) : null}
    </div>
  );
}
