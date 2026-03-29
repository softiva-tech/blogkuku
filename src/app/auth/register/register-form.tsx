"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm({
  registerUser,
}: {
  registerUser: (fd: FormData) => Promise<{ ok?: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="mt-8 space-y-4"
      action={async (fd) => {
        setMessage(null);
        const r = await registerUser(fd);
        if (r.error) {
          setMessage(r.error);
          return;
        }
        router.push("/auth/signin?registered=1");
        router.refresh();
      }}
    >
      <div>
        <label htmlFor="name" className="block text-sm text-ink-300">
          Display name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
        />
      </div>
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
          Password (min 8 characters)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 text-ink-100 focus:border-ember-500/60 focus:outline-none focus:ring-1 focus:ring-ember-500/30"
        />
      </div>
      {message ? (
        <p className="text-sm text-amber-400" role="status">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        className="w-full rounded-full bg-ember-500 py-2.5 text-sm font-semibold text-white transition hover:bg-ember-600"
      >
        Create account
      </button>
    </form>
  );
}
