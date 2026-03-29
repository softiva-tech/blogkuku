import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const withAuth = auth((req) => {
  const path = req.nextUrl.pathname;

  if (
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  if (path.startsWith("/auth/blocked")) {
    return NextResponse.next();
  }

  if (req.auth?.user?.blocked) {
    return NextResponse.redirect(new URL("/auth/blocked", req.url));
  }

  if (!path.startsWith("/admin")) {
    return NextResponse.next();
  }

  const role = req.auth?.user?.role;
  if (role !== "ADMIN") {
    const signIn = new URL("/auth/signin", req.nextUrl.origin);
    signIn.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
});

export default async function middleware(req: NextRequest, evt: NextFetchEvent) {
  try {
    return await (
      withAuth as unknown as (
        r: NextRequest,
        e: NextFetchEvent,
      ) => Promise<Response | NextResponse>
    )(req, evt);
  } catch (err) {
    console.error("[middleware] auth failed:", err);
    const path = req.nextUrl.pathname;
    if (path.startsWith("/admin")) {
      const signIn = new URL("/auth/signin", req.url);
      signIn.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signIn);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
