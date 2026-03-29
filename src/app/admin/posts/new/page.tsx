import Link from "next/link";
import { createPost } from "@/lib/actions";
import { AdminPostEditorClient } from "@/components/admin-post-editor-client";
import { prisma } from "@/lib/prisma";
import { PostApprovalStatus } from "@prisma/client";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <Link
        href="/admin/posts"
        className="text-sm text-ink-400 hover:text-ember-500"
      >
        ← Back to posts
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink-50">New post</h1>
      <AdminPostEditorClient
        categories={categories}
        saveAction={createPost}
        submitLabel="Create post"
        defaults={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          approvalStatus: PostApprovalStatus.APPROVED,
        }}
      />
    </div>
  );
}
