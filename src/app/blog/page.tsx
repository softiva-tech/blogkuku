import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { publicPostWhere } from "@/lib/post-live";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;

  const category = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug } })
    : null;

  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
      where: {
        ...publicPostWhere,
        ...(category
          ? { categoryId: category.id }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-ink-50">All articles</h1>
      <p className="mt-3 max-w-2xl text-ink-400">
        Filter by category. Submissions from readers appear after approval.
      </p>

      {categories.length > 0 ? (
        <nav className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full px-4 py-1.5 text-sm ${
              !categorySlug
                ? "bg-ember-500 text-white"
                : "border border-ink-700 text-ink-300 hover:border-ember-500/40"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?category=${encodeURIComponent(c.slug)}`}
              className={`rounded-full px-4 py-1.5 text-sm ${
                categorySlug === c.slug
                  ? "bg-ember-500 text-white"
                  : "border border-ink-700 text-ink-300 hover:border-ember-500/40"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      ) : null}

      <ul className="mt-12 space-y-10">
        {posts.map((post) => (
          <li key={post.id} className="group border-b border-ink-800/80 pb-10">
            <Link href={`/blog/${post.slug}`} className="block sm:flex sm:gap-8">
              {post.coverImageUrl ? (
                <div className="mb-4 shrink-0 overflow-hidden rounded-xl border border-ink-800 sm:mb-0 sm:w-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="h-36 w-full object-cover transition group-hover:opacity-90 sm:h-28 sm:w-52"
                  />
                </div>
              ) : null}
              <div className="min-w-0">
                {post.category ? (
                  <p className="text-xs uppercase tracking-wider text-ember-500">
                    {post.category.name}
                  </p>
                ) : null}
                <h2 className="mt-1 font-display text-2xl text-ink-50 transition group-hover:text-ember-500">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="mt-3 text-ink-300">{post.excerpt}</p>
                ) : null}
                <p className="mt-4 text-xs uppercase tracking-wider text-ink-500">
                  {post.author.name || post.author.email} ·{" "}
                  {post.createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {posts.length === 0 ? (
        <p className="mt-10 text-ink-500">
          {categorySlug
            ? "No posts in this category yet."
            : "No published posts yet."}
        </p>
      ) : null}
    </div>
  );
}
