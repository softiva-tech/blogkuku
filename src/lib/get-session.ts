import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

export async function getSessionSafe(): Promise<Session | null> {
  try {
    return (await auth()) ?? null;
  } catch {
    return null;
  }
}
