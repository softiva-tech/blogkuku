"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ImpersonateClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const token = sp.get("token");
    if (!token) {
      setMessage("Missing token. Ask an admin to generate a new link.");
      return;
    }

    void (async () => {
      const res = await signIn("impersonate", {
        token,
        redirect: false,
        callbackUrl: "/",
      });
      if (res?.error) {
        setMessage("Link expired or invalid. Request a new one from an admin.");
        return;
      }
      router.replace(res?.url ?? "/");
      router.refresh();
    })();
  }, [sp, router]);

  return (
    <p className="mx-auto max-w-md px-4 py-20 text-center text-ink-400">
      {message}
    </p>
  );
}
