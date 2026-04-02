const DEFAULT_LOCAL = "http://localhost:3000";

/** Turn panel-style host values into an absolute URL string; never throws. */
function normalizeToAbsoluteUrl(raw: string): string {
  const t = raw.trim().replace(/\/+$/, "");
  if (!t) return DEFAULT_LOCAL;
  const withScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return DEFAULT_LOCAL;
    const path =
      u.pathname === "/" ? "" : u.pathname.replace(/\/+$/, "");
    return `${u.origin}${path}`;
  } catch {
    return DEFAULT_LOCAL;
  }
}

export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL?.trim()) {
    return normalizeToAbsoluteUrl(process.env.NEXTAUTH_URL);
  }
  if (process.env.VERCEL_URL?.trim()) {
    try {
      return new URL(`https://${process.env.VERCEL_URL.trim()}`).origin;
    } catch {
      return DEFAULT_LOCAL;
    }
  }
  return DEFAULT_LOCAL;
}

/** For `metadataBase` — valid URL or localhost fallback. */
export function getMetadataBaseUrl(): URL {
  try {
    return new URL(getBaseUrl());
  } catch {
    return new URL(DEFAULT_LOCAL);
  }
}
