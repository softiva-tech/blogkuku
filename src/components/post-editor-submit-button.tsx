"use client";

import { useFormStatus } from "react-dom";

export function PostEditorSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ember-500 px-8 py-2.5 text-sm font-semibold text-white hover:bg-ember-600 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
