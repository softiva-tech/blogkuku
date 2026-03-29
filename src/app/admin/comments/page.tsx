import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteComment, setCommentApproved } from "@/lib/actions";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      post: { select: { title: true, slug: true } },
    },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-50">Comments</h1>
      <p className="mt-1 text-sm text-ink-400">
        Hide spam or remove threads. Readers only see approved comments on posts.
      </p>
      <ul className="mt-10 space-y-6">
        {comments.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-ink-800 bg-ink-900/40 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink-100">
                  {c.user.name || c.user.email}
                </p>
                <p className="text-xs text-ink-500">
                  On{" "}
                  <Link
                    href={`/blog/${c.post.slug}`}
                    className="text-ember-500 hover:underline"
                  >
                    {c.post.title}
                  </Link>{" "}
                  · {c.createdAt.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    c.approved
                      ? "bg-emerald-950/60 text-emerald-300"
                      : "bg-amber-950/50 text-amber-200"
                  }`}
                >
                  {c.approved ? "Visible" : "Hidden"}
                </span>
                <form
                  action={
                    setCommentApproved.bind(
                      null,
                      c.id,
                      !c.approved,
                    ) as unknown as (fd: FormData) => void | Promise<void>
                  }
                >
                  <button
                    type="submit"
                    className="rounded-md border border-ink-700 px-2 py-1 text-xs text-ink-200 hover:border-ember-500/40"
                  >
                    {c.approved ? "Hide" : "Approve"}
                  </button>
                </form>
                <form
                  action={
                    deleteComment.bind(null, c.id) as unknown as (
                      fd: FormData,
                    ) => void | Promise<void>
                  }
                >
                  <button
                    type="submit"
                    className="rounded-md border border-red-900/50 px-2 py-1 text-xs text-red-300 hover:bg-red-950/40"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-ink-300">{c.body}</p>
          </li>
        ))}
      </ul>
      {comments.length === 0 ? (
        <p className="mt-8 text-sm text-ink-500">No comments yet.</p>
      ) : null}
    </div>
  );
}
