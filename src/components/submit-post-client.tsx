"use client";

import { useState } from "react";
import {
  PostEditorForm,
  type PostEditorCategory,
} from "@/components/post-editor-form";
import { submitUserPost } from "@/lib/actions";

export function SubmitPostClient({
  categories,
}: {
  categories: PostEditorCategory[];
}) {
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );
  const [formKey, setFormKey] = useState(0);

  return (
    <div>
      {banner ? (
        <p
          className={
            banner.type === "ok"
              ? "mt-0 rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200"
              : "mt-0 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          }
          role="status"
        >
          {banner.text}
        </p>
      ) : null}
      <PostEditorForm
        key={formKey}
        variant="submit"
        categories={categories}
        submitLabel="Submit for review"
        action={async (fd) => {
          setBanner(null);
          const r = await submitUserPost(fd);
          if (r && "error" in r && r.error) {
            setBanner({ type: "err", text: r.error });
            return;
          }
          setFormKey((k) => k + 1);
          setBanner({
            type: "ok",
            text: "Thanks — your post is pending admin approval.",
          });
        }}
      />
    </div>
  );
}
