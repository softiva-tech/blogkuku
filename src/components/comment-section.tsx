import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addComment } from "@/lib/actions";
import { CommentForm } from "@/components/comment-form";
import type { Prisma } from "@prisma/client";

type CommentSectionProps = {
  postId: string;
};

export async function CommentSection({ postId }: CommentSectionProps) {
  const session = await auth();
  type CommentWithUser = Prisma.CommentGetPayload<{
    include: { user: { select: { name: true; email: true } } };
  }>;
  let comments: CommentWithUser[] = [];
  try {
    comments = await prisma.comment.findMany({
      where: { postId, approved: true },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true, email: true } } },
    });
  } catch (e) {
    // During deploys, DB creds/availability can be temporarily wrong — don't crash RSC.
    console.error("[comments] load failed:", e);
  }

  return (
    <section className="mt-12 border-t border-ink-800 pt-10">
      <h2 className="font-display text-2xl text-ink-50">Comments</h2>
      <p className="mt-2 text-sm text-ink-400">
        {session
          ? "Share your perspective. Be kind."
          : "Sign in to join the conversation."}
      </p>

      <ul className="mt-8 space-y-6">
        {comments.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-ink-800/80 bg-ink-900/40 px-5 py-4"
          >
            <p className="text-sm font-medium text-ink-200">
              {c.user.name || c.user.email}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-ink-300">{c.body}</p>
            <p className="mt-3 text-xs text-ink-500">
              {c.createdAt.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </li>
        ))}
      </ul>

      {comments.length === 0 ? (
        <p className="mt-6 text-sm text-ink-500">No comments yet.</p>
      ) : null}

      {session ? (
        <CommentForm postId={postId} addComment={addComment} />
      ) : (
        <p className="mt-8 text-sm text-ink-400">
          <a href="/auth/signin" className="text-ember-500 hover:underline">
            Sign in
          </a>{" "}
          to comment.
        </p>
      )}
    </section>
  );
}
