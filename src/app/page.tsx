import Image from "next/image";
import Link from "next/link";
import { BrandTitle } from "@/components/brand-title";
import { HOME_HERO_IMAGE_PATH } from "@/lib/brand";
import { prisma } from "@/lib/prisma";
import { publicPostWhere } from "@/lib/post-live";

export default async function HomePage() {
  let postCount = 0;
  let categoryEstimate = 3;

  try {
    const [count, posts] = await Promise.all([
      prisma.post.count({ where: { ...publicPostWhere } }),
      prisma.post.findMany({
        where: { ...publicPostWhere },
        select: { title: true },
        take: 50,
      }),
    ]);
    postCount = count;
    categoryEstimate =
      Math.min(
        new Set(
          posts
            .flatMap((p) => p.title.toLowerCase().split(/\W+/))
            .filter((w) => w.length > 4),
        ).size,
        12,
      ) || 3;
  } catch {
    /* DB unreachable or schema drift — still render shell */
  }

  return (
    <div>
      <section className="relative isolate flex min-h-[min(100dvh,56rem)] w-full items-end overflow-hidden sm:min-h-[min(100dvh,64rem)]">
        <Image
          src={HOME_HERO_IMAGE_PATH}
          alt="Golden Temple (Harmandir Sahib) at Amritsar, reflected in the sacred pool"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/50 to-black/70"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(196,92,62,0.12),_transparent_50%)]" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-200/90">
            Welcome to <BrandTitle className="inline" />
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight tracking-tight text-white drop-shadow-sm sm:text-6xl sm:leading-tight">
            Stories That Move the World
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Thoughtful articles on technology, culture, and ideas that matter.
            Written by curious minds for curious readers.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/blog"
              className="rounded-full bg-ember-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ember-600"
            >
              Start Reading
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full border border-white/25 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-amber-300/40 hover:bg-white/10"
            >
              Join Community
            </Link>
          </div>
          <p className="mt-16 text-xs uppercase tracking-widest text-white/45">
            Scroll
          </p>
        </div>
      </section>

      <section className="border-y border-ink-800/80 bg-ink-900/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
          <div>
            <p className="font-display text-4xl text-ink-50">{postCount}+</p>
            <p className="mt-1 text-sm text-ink-400">Articles Published</p>
          </div>
          <div>
            <p className="font-display text-4xl text-ink-50">{categoryEstimate}</p>
            <p className="mt-1 text-sm text-ink-400">Topic threads</p>
          </div>
          <div>
            <p className="font-display text-4xl text-ink-50">10K+</p>
            <p className="mt-1 text-sm text-ink-400">Readers Monthly</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-2xl text-ink-50 sm:text-3xl">
          {postCount === 0 ? "No stories yet" : "Latest voices"}
        </h2>
        {postCount === 0 ? (
          <p className="mt-4 text-ink-400">
            Check back soon for amazing content — or sign in as admin to publish.
          </p>
        ) : (
          <p className="mt-4 text-ink-400">
            Browse the full archive on the blog. Comments and sharing are built in.
          </p>
        )}
        <Link
          href="/blog"
          className="mt-8 inline-flex rounded-full border border-ink-600 px-6 py-2 text-sm font-medium text-ink-100 hover:border-ember-500/50"
        >
          Browse All Articles
        </Link>
      </section>

      <section className="border-t border-ink-800/80 bg-gradient-to-b from-ink-900/40 to-ink-950">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl text-ink-50">Ready to dive in?</h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-400">
            Join readers who follow our best articles. Create an account to comment
            and take part in the threads.
          </p>
          <Link
            href="/blog"
            className="mt-8 inline-flex rounded-full bg-ember-500 px-8 py-3 text-sm font-semibold text-white hover:bg-ember-600"
          >
            Browse All Articles
          </Link>
        </div>
      </section>
    </div>
  );
}
