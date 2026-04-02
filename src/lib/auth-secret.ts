const BUILD_PLACEHOLDER_SECRET = "0123456789abcdef0123456789abcdef";

/** True while `next build` is running (Next sets this internally). */
function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/** Resolves the signing secret used by Auth.js for JWT / cookies. */
export function getAuthSecret(): string {
  const raw = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const trimmed = typeof raw === "string" ? raw.trim() : "";

  if (trimmed.length >= 32) {
    return trimmed;
  }

  if (isNextProductionBuild()) {
    console.warn(
      "[auth] AUTH_SECRET is missing or short during `next build`. Using a temporary secret so the build can finish. Set AUTH_SECRET (≥32 chars) in your host’s environment for runtime — login will not work until you do.",
    );
    return BUILD_PLACEHOLDER_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[auth] AUTH_SECRET (or NEXTAUTH_SECRET) is missing or shorter than 32 characters. Using a fixed dev-only secret — local sessions may reset when you set a real secret.",
    );
    return BUILD_PLACEHOLDER_SECRET;
  }

  // Production runtime: throwing here runs before `getSessionSafe()` can catch and breaks every page.
  console.error(
    "[auth] AUTH_SECRET (or NEXTAUTH_SECRET) is missing or shorter than 32 characters. Set one with: openssl rand -base64 32 — using a temporary secret so the site can render (fix this in hPanel / .env immediately).",
  );
  return BUILD_PLACEHOLDER_SECRET;
}
