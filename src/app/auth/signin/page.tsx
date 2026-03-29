import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink-50">Sign in</h1>
      <p className="mt-2 text-sm text-ink-400">
        Welcome back. No account?{" "}
        <Link href="/auth/register" className="text-ember-500 hover:underline">
          Create one
        </Link>
        .
      </p>
      {sp.registered === "1" ? (
        <p
          className="mt-4 rounded-lg border border-emerald-900/50 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-200"
          role="status"
        >
          Account created. You can sign in below. An administrator must{" "}
          <strong>approve submit access</strong> for your account before you can
          send stories from <strong>Submit</strong>; you can still read and
          comment in the meantime.
        </p>
      ) : null}
      <SignInForm callbackUrl={sp.callbackUrl} />
    </div>
  );
}
