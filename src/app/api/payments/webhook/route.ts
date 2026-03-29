import { NextResponse } from "next/server";

/** Placeholder for Stripe (or other) webhooks — verify signature in production */
export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Webhook not configured" },
    { status: 501 },
  );
}
