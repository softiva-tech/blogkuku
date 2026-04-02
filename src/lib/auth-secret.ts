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

  throw new Error(
    "AUTH_SECRET must be at least 32 characters in production. Generate one with: openssl rand -base64 32",
  );
}
