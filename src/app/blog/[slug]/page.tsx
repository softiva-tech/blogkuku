import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MarkdownBody } from "@/components/markdown-body";
import { ShareBar } from "@/components/share-bar";
import { CommentSection } from "@/components/comment-section";
import { getBaseUrl } from "@/lib/base-url";
import { publicPostWhere } from "@/lib/post-live";
import { getSiteSettings } from "@/lib/site-settings";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, ...publicPostWhere },
  });
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt ?? post.title,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, ...publicPostWhere },
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true, slug: true } },
    },
  });
  if (!post) notFound();

  const base = getBaseUrl();
  const url = `${base}/blog/${post.slug}`;
  const embed = getYouTubeEmbedUrl(post.youtubeUrl);

  let siteInstagramUrl: string | null = null;
  try {
    const s = await getSiteSettings();
    siteInstagramUrl = s.socialInstagramUrl;
  } catch {
    /* DB unavailable */
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      {post.category ? (
        <p className="text-xs uppercase tracking-[0.2em] text-ember-500">
          {post.category.name}
        </p>
      ) : (
        <p className="text-xs uppercase tracking-[0.2em] text-ember-500">Essay</p>
      )}
      <h1 className="mt-3 font-display text-4xl leading-tight text-ink-50 sm:text-5xl">
        {post.title}
      </h1>
      <p className="mt-6 text-sm text-ink-400">
        By {post.author.name || post.author.email} ·{" "}
        {post.updatedAt.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      {post.coverImageUrl ? (
        <div className="mt-10 overflow-hidden rounded-2xl border border-ink-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt=""
            className="max-h-[420px] w-full object-cover"
          />
        </div>
      ) : null}
      {embed ? (
        <div className="mt-10 aspect-video overflow-hidden rounded-2xl border border-ink-800 bg-black">
          <iframe
            src={embed}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : null}
      <div className="mt-10">
        <MarkdownBody content={post.content} />
      </div>
      <ShareBar
        url={url}
        title={post.title}
        description={post.excerpt}
        siteInstagramUrl={siteInstagramUrl}
      />
      <CommentSection postId={post.id} />
    </article>
  );
}
