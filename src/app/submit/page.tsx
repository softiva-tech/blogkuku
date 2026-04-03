import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubmitPostClient } from "@/components/submit-post-client";
import { getSiteSettings } from "@/lib/site-settings";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/submit");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin/posts/new");
  }

  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let dbUser: { writerApproved: boolean } | null = null;
  try {
    const [c, user] = await Promise.all([
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { writerApproved: true },
      }),
    ]);
    categories = c;
    dbUser = user;
  } catch (e) {
    console.error("[submit] DB load failed:", e);
  }

  const settings = await getSiteSettings();

  if (!dbUser?.writerApproved) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-3xl text-ink-50">Submit a story</h1>
        <p className="mt-4 rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
          Your account is not approved to submit stories yet. After an
          administrator enables submissions for you, the <strong>Submit</strong>{" "}
          link will appear in the header and you can send drafts for review.
        </p>
        <p className="mt-4 text-sm text-ink-400">
          You can still read articles and join the conversation in comments.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/blog" className="text-ember-500 hover:underline">
            ← Back to blog
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-ink-50">Submit a story</h1>
      <p className="mt-2 text-sm text-ink-400">
        Your post will be reviewed by an editor before it appears on the blog.
      </p>
      {settings.dailyPostLimitEnabled ? (
        <p className="mt-3 rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-2 text-sm text-amber-200">
          Daily submission cap is <strong>on</strong>: max{" "}
          <strong>{settings.dailyPostLimitCount}</strong> posts per day per
          author (UTC calendar day).
        </p>
      ) : null}
      <p className="mt-4 text-sm">
        <Link href="/blog" className="text-ember-500 hover:underline">
          ← Back to blog
        </Link>
      </p>
      <SubmitPostClient categories={categories} />
    </div>
  );
}
