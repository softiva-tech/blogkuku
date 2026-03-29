import { signOutAction } from "@/lib/actions";

export default function BlockedPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-2xl text-ink-50">Account suspended</h1>
      <p className="mt-4 text-sm text-ink-400">
        This account has been blocked by an administrator. If you think this is a
        mistake, contact support.
      </p>
      <form action={signOutAction} className="mt-10">
        <button
          type="submit"
          className="rounded-full border border-ink-600 px-6 py-2 text-sm text-ink-100 hover:border-ember-500/50"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
