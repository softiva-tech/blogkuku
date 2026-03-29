import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import { signOutAction } from "@/lib/actions";
import { BrandTitle } from "@/components/brand-title";
import { BRAND_LOGO_PATH } from "@/lib/brand";
import { SITE_NAME } from "@/lib/site";

export function SiteHeader({ session }: { session: Session | null }) {
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="border-b border-ink-800/80 bg-ink-950/70 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg tracking-tight text-ink-50"
        >
          <Image
            src={BRAND_LOGO_PATH}
            alt={SITE_NAME}
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 rounded-md object-cover"
            priority
          />
          <BrandTitle className="leading-tight" />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1 text-sm text-ink-300">
          <Link
            href="/blog"
            className="rounded-md px-3 py-2 transition hover:bg-ink-900 hover:text-ink-100"
          >
            Blog
          </Link>
          {session && !isAdmin && session.user.writerApproved ? (
            <Link
              href="/submit"
              className="rounded-md px-3 py-2 transition hover:bg-ink-900 hover:text-ink-100"
            >
              Submit
            </Link>
          ) : null}
          {isAdmin ? (
            <Link
              href="/admin"
              className="rounded-md px-3 py-2 transition hover:bg-ink-900 hover:text-ink-100"
            >
              Admin
            </Link>
          ) : null}
          {session ? (
            <form action={signOutAction} className="inline">
              <button
                type="submit"
                className="rounded-md px-3 py-2 transition hover:bg-ink-900 hover:text-ink-100"
              >
                Sign out
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="rounded-md px-3 py-2 transition hover:bg-ink-900 hover:text-ink-100"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="ml-1 rounded-md bg-ember-500 px-3 py-2 font-medium text-white transition hover:bg-ember-600"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
