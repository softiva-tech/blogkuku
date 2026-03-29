import Link from "next/link";
import { registerUser } from "@/lib/actions";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink-50">Join the community</h1>
      <p className="mt-2 text-sm text-ink-400">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-ember-500 hover:underline">
          Sign in
        </Link>
        .
      </p>
      <p className="mt-3 text-sm text-ink-500">
        After you register, an admin must approve your account before you can
        submit stories. You can read and comment right away.
      </p>
      <RegisterForm registerUser={registerUser} />
    </div>
  );
}
