"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const nextUrl = callbackUrl ?? "/blog";

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setPending(true);
        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") ?? "");
        const password = String(fd.get("password") ?? "");
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: nextUrl,
        });
        setPending(false);
        if (res?.error) {
          setError("Invalid email or password");
          return;
        }
        router.push(res?.url ?? nextUrl);
        router.refresh();
      }}
    >
      <div>
        <label htmlFor="email" className="block text-sm text-ink-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-ink-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ember-500 py-2.5 text-sm font-semibold text-white transition hover:bg-ember-600 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
