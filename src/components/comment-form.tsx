"use client";

import { useRef } from "react";

type Props = {
  postId: string;
  addComment: (postId: string, formData: FormData) => Promise<{ ok?: boolean; error?: string }>;
};

export function CommentForm({ postId, addComment }: Props) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      className="mt-8 space-y-3"
      action={async (fd) => {
        const res = await addComment(postId, fd);
        if (res?.ok) ref.current?.reset();
      }}
    >
      <label htmlFor="body" className="sr-only">
        Your comment
      </label>
      <textarea
        id="body"
        name="body"
        required
        rows={4}
        placeholder="Write something thoughtful…"
        className="w-full rounded-xl border border-ink-700 bg-ink-950/60 px-4 py-3 text-ink-100 placeholder:text-ink-600 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/40"
      />
      <button
        type="submit"
        className="rounded-full bg-ember-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-ember-600"
      >
        Post comment
      </button>
    </form>
  );
}
