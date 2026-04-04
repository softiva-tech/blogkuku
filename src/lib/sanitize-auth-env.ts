/**
 * Auth.js calls `new URL(AUTH_URL ?? NEXTAUTH_URL)` during API route handling.
 * A bad value (typo, `https://` with no host, DB URL pasted into the wrong var)
 * throws `TypeError: Invalid URL` and breaks `/api/auth/*`.
 *
 * If invalid, we clear the var so `trustHost` + request headers can build the URL.
 *
 * **Important:** `next-auth` reads `AUTH_URL` / `NEXTAUTH_URL` and, if the pathname is
 * not `/`, sets `config.basePath` to that path (see `next-auth/lib/env.js`). A value like
 * `https://site.com/blog` makes basePath `/blog`, so `/api/auth/*` no longer parses →
 * 400 "Bad request." We therefore keep **origin only** (no path).
 */
export function sanitizeAuthPublicUrlEnv(): void {
  for (const key of ["AUTH_URL", "NEXTAUTH_URL"] as const) {
    const raw = process.env[key];
    if (raw === undefined || raw === null) continue;
    const trimmed = String(raw).trim();
    if (!trimmed) {
      delete process.env[key];
      continue;
    }
    // Common mistake: DB connection string in the site-URL variable
    if (/^mysql(2)?:\/\//i.test(trimmed)) {
      console.error(
        `[auth] ${key} looks like a database URL. Remove it or set a full site URL (https://yourdomain.com).`,
      );
      delete process.env[key];
      continue;
    }
    const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    try {
      const u = new URL(candidate);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        throw new Error("not http(s)");
      }
      if (!u.hostname) {
        throw new Error("no hostname");
      }
      if (u.pathname && u.pathname !== "/") {
        console.warn(
          `[auth] ${key} contained a path (${u.pathname}). NextAuth would mis-set basePath; using origin only: ${u.origin}`,
        );
      }
      process.env[key] = u.origin;
    } catch {
      console.error(
        `[auth] Invalid ${key}="${trimmed.slice(0, 80)}${trimmed.length > 80 ? "…" : ""}" — clearing so Auth.js can use request host (trustHost).`,
      );
      delete process.env[key];
    }
  }
}
