"use client";

import {
  PostApprovalStatus,
  type PostApprovalStatus as PostApprovalStatusType,
} from "@/lib/post-approval-status";
import { PostEditorSubmitButton } from "@/components/post-editor-submit-button";

export type PostEditorCategory = { id: string; name: string; slug: string };

type PostEditorFormProps = {
  /** Server action — may redirect or return metadata; widened for React form types */
  action: (formData: FormData) => void | Promise<unknown>;
  defaults?: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImageUrl?: string | null;
    youtubeUrl?: string | null;
    categoryId?: string | null;
    approvalStatus?: PostApprovalStatusType;
  };
  submitLabel: string;
  variant: "admin" | "submit";
  categories: PostEditorCategory[];
};

const statusLabels: Record<PostApprovalStatusType, string> = {
  [PostApprovalStatus.DRAFT]: "Draft",
  [PostApprovalStatus.PENDING]: "Pending approval",
  [PostApprovalStatus.APPROVED]: "Approved (live)",
  [PostApprovalStatus.REJECTED]: "Rejected",
};

export function PostEditorForm({
  action,
  defaults,
  submitLabel,
  variant,
  categories,
}: PostEditorFormProps) {
  return (
    <form
      action={action as unknown as (formData: FormData) => void | Promise<void>}
      encType="multipart/form-data"
      className="mt-8 max-w-3xl space-y-6"
    >
      <div>
        <label htmlFor="title" className="block text-sm text-ink-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaults?.title}
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
        />
      </div>
      {variant === "admin" ? (
        <div>
          <label htmlFor="slug" className="block text-sm text-ink-300">
            Slug (optional — auto from title if empty)
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={defaults?.slug}
            className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
          />
        </div>
      ) : null}
      <div>
        <label htmlFor="categoryId" className="block text-sm text-ink-300">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={defaults?.categoryId ?? ""}
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
        >
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <span className="block text-sm text-ink-300">Cover image</span>
        <p className="mt-1 text-xs text-ink-500">
          Upload a file (JPEG, PNG, GIF, or WebP, max 5MB) or paste an external
          URL. Leave both empty to remove the cover.
        </p>
        {defaults?.coverImageUrl ? (
          <div className="mt-3 overflow-hidden rounded-lg border border-ink-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={defaults.coverImageUrl}
              alt=""
              className="max-h-44 w-full object-cover"
            />
          </div>
        ) : null}
        <label htmlFor="coverImageFile" className="mt-3 block text-xs text-ink-400">
          Upload file
        </label>
        <input
          id="coverImageFile"
          name="coverImageFile"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="mt-1 block w-full text-sm text-ink-300 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-800 file:px-3 file:py-2 file:text-ink-100 file:hover:bg-ink-700"
        />
        <label htmlFor="coverImageUrl" className="mt-4 block text-sm text-ink-300">
          Or image URL
        </label>
        <input
          id="coverImageUrl"
          name="coverImageUrl"
          type="text"
          placeholder="https://example.com/image.jpg"
          defaultValue={defaults?.coverImageUrl ?? ""}
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
        />
      </div>
      <div>
        <label htmlFor="youtubeUrl" className="block text-sm text-ink-300">
          YouTube URL (watch, youtu.be, or embed)
        </label>
        <input
          id="youtubeUrl"
          name="youtubeUrl"
          placeholder="https://www.youtube.com/watch?v=…"
          defaultValue={defaults?.youtubeUrl ?? ""}
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
        />
      </div>
      <div>
        <label htmlFor="excerpt" className="block text-sm text-ink-300">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={defaults?.excerpt}
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm text-ink-300">
          Body (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={variant === "submit" ? 14 : 18}
          defaultValue={defaults?.content}
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 font-mono text-sm text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
        />
      </div>
      {variant === "admin" ? (
        <div>
          <label htmlFor="approvalStatus" className="block text-sm text-ink-300">
            Publication status
          </label>
          <select
            id="approvalStatus"
            name="approvalStatus"
            defaultValue={
              defaults?.approvalStatus ?? PostApprovalStatus.APPROVED
            }
            className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
          >
            {(Object.keys(statusLabels) as PostApprovalStatusType[]).map((k) => (
              <option key={k} value={k}>
                {statusLabels[k]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-ink-500">
            Only <strong>Approved</strong> posts appear on the public blog.
          </p>
        </div>
      ) : (
        <p className="text-sm text-ink-400">
          Submissions are sent to <strong>Pending</strong>. An admin will approve
          or reject them.
        </p>
      )}
      <PostEditorSubmitButton label={submitLabel} />
    </form>
  );
}
