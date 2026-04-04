"use client";

/**
 * Catches errors in the root layout (normal `error.tsx` does not).
 * Keep markup self-contained — this replaces the root `<html>` / `<body>`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 px-4 py-16 text-ink-100">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-display text-2xl">Something went wrong</h1>
          <p className="mt-4 text-sm text-ink-400">
            The site hit an error in the root layout. Check the server logs for
            details (database URL, missing env, or failed startup).
          </p>
          {error.digest ? (
            <p className="mt-2 font-mono text-xs text-ink-600">Digest: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-full bg-ember-500 px-6 py-2 text-sm font-medium text-white hover:bg-ember-600"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
