"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-2xl text-ink-50">Something went wrong</h1>
      <p className="mt-4 text-sm text-ink-400">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-ink-600">Digest: {error.digest}</p>
      ) : null}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-ember-500 px-6 py-2 text-sm font-medium text-white hover:bg-ember-600"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-ink-600 px-6 py-2 text-sm text-ink-200 hover:border-ember-500/50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
