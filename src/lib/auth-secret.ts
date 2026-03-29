/** Resolves the signing secret used by Auth.js for JWT / cookies. */
export function getAuthSecret(): string {
  const raw = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const trimmed = typeof raw === "string" ? raw.trim() : "";

  if (trimmed.length >= 32) {
    return trimmed;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[auth] AUTH_SECRET (or NEXTAUTH_SECRET) is missing or shorter than 32 characters. Using a fixed dev-only secret — local sessions may reset when you set a real secret.",
    );
    return "0123456789abcdef0123456789abcdef"; // exactly 32 chars, dev only
  }

  throw new Error(
    "AUTH_SECRET must be at least 32 characters in production. Generate one with: openssl rand -base64 32",
  );
}
