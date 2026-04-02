"use client";

import { useActionState } from "react";
import {
  PostEditorForm,
  type PostEditorCategory,
} from "@/components/post-editor-form";
import type { PostApprovalStatus } from "@/lib/post-approval-status";

type Defaults = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  youtubeUrl?: string | null;
  categoryId?: string | null;
  approvalStatus?: PostApprovalStatus;
};

export function AdminPostEditorClient(props: {
  saveAction: (formData: FormData) => Promise<unknown>;
  submitLabel: string;
  categories: PostEditorCategory[];
  defaults?: Defaults;
}) {
  const { saveAction, submitLabel, categories, defaults } = props;

  const [error, formAction] = useActionState(
    async (_: string | null, formData: FormData) => {
      const r = await saveAction(formData);
      if (r && typeof r === "object" && r !== null && "error" in r) {
        const err = (r as { error?: string }).error;
        if (err) return err;
      }
      return null;
    },
    null,
  );

  return (
    <div>
      {error ? (
        <p
          className="mt-4 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <PostEditorForm
        variant="admin"
        categories={categories}
        action={formAction as (formData: FormData) => void | Promise<void>}
        submitLabel={submitLabel}
        defaults={defaults}
      />
    </div>
  );
}
