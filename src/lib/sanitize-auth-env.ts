/**
 * Auth.js calls `new URL(AUTH_URL ?? NEXTAUTH_URL)` during API route handling.
 * A bad value (typo, `https://` with no host, DB URL pasted into the wrong var)
 * throws `TypeError: Invalid URL` and breaks `/api/auth/*`.
 *
 * If invalid, we clear the var so `trustHost` + request headers can build the URL.
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
      const path =
        u.pathname === "/" ? "" : u.pathname.replace(/\/+$/, "");
      process.env[key] = `${u.origin}${path}`;
    } catch {
      console.error(
        `[auth] Invalid ${key}="${trimmed.slice(0, 80)}${trimmed.length > 80 ? "…" : ""}" — clearing so Auth.js can use request host (trustHost).`,
      );
      delete process.env[key];
    }
  }
}
