import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePost } from "@/lib/actions";
import { AdminPostEditorClient } from "@/components/admin-post-editor-client";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!post) notFound();

  const save = updatePost.bind(null, post.id);

  return (
    <div>
      <Link
        href="/admin/posts"
        className="text-sm text-ink-400 hover:text-ember-500"
      >
        ← Back to posts
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink-50">Edit post</h1>
      <AdminPostEditorClient
        categories={categories}
        saveAction={save}
        submitLabel="Save changes"
        defaults={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImageUrl: post.coverImageUrl,
          youtubeUrl: post.youtubeUrl,
          categoryId: post.categoryId,
          approvalStatus: post.approvalStatus,
        }}
      />
    </div>
  );
}
