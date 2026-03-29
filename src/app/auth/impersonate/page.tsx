import { Suspense } from "react";
import { ImpersonateClient } from "./impersonate-client";

export default function ImpersonatePage() {
  return (
    <Suspense
      fallback={
        <p className="mx-auto max-w-md px-4 py-20 text-center text-ink-400">
          Signing you in…
        </p>
      }
    >
      <ImpersonateClient />
    </Suspense>
  );
}
