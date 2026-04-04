import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/auth-secret";

export default async function middleware(req: NextRequest) {
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

  try {
    // Edge middleware often does not see the same env as `node server.js`. Raw
    // `process.env.AUTH_SECRET` can be empty → getToken throws MissingSecret → 500.
    const token = await getToken({
      req,
      secret: getAuthSecret(),
    });

    if (token?.blocked) {
      return NextResponse.redirect(new URL("/auth/blocked", req.url));
    }

    if (!path.startsWith("/admin")) {
      return NextResponse.next();
    }

    const role = typeof token?.role === "string" ? token.role : undefined;
    if (role !== "ADMIN") {
      const signIn = new URL("/auth/signin", req.nextUrl.origin);
      signIn.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signIn);
    }

    return NextResponse.next();
  } catch (err) {
    console.error("[middleware] token check failed:", err);
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
