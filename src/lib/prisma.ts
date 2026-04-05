import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function validPostgresUrl(url: string | undefined): boolean {
  const t = url?.trim() ?? "";
  return t.startsWith("postgresql://") || t.startsWith("postgres://");
}

/** Supabase dashboard may expose the URI under a different name. */
function ensureDatabaseUrlFromAliases(): void {
  if (validPostgresUrl(process.env.DATABASE_URL)) return;
  const alt = process.env.SUPABASE_DATABASE_URL?.trim();
  if (alt && validPostgresUrl(alt)) {
    process.env.DATABASE_URL = alt;
    console.info("[prisma] Using SUPABASE_DATABASE_URL as DATABASE_URL.");
  }
}

/**
 * If `DATABASE_URL` is missing or invalid, build `postgresql://` from common env names
 * (Docker / some hosts expose split POSTGRES_* or PG* vars).
 */
function ensureDatabaseUrlFromParts(): void {
  if (validPostgresUrl(process.env.DATABASE_URL)) return;

  const host =
    process.env.POSTGRES_HOST?.trim() ||
    process.env.PGHOST?.trim() ||
    process.env.DB_HOST?.trim() ||
    process.env.DATABASE_HOST?.trim();
  const user =
    process.env.POSTGRES_USER?.trim() ||
    process.env.PGUSER?.trim() ||
    process.env.DB_USER?.trim() ||
    process.env.DATABASE_USER?.trim();
  const password =
    process.env.POSTGRES_PASSWORD ??
    process.env.PGPASSWORD ??
    process.env.DB_PASSWORD ??
    process.env.DATABASE_PASSWORD ??
    "";
  const database =
    process.env.POSTGRES_DATABASE?.trim() ||
    process.env.PGDATABASE?.trim() ||
    process.env.DB_NAME?.trim() ||
    process.env.DATABASE_NAME?.trim();
  const port =
    process.env.POSTGRES_PORT?.trim() ||
    process.env.PGPORT?.trim() ||
    process.env.DB_PORT?.trim() ||
    process.env.DATABASE_PORT?.trim() ||
    "5432";

  if (!host || !user || !database) return;

  const u = encodeURIComponent(user);
  const p = encodeURIComponent(String(password));
  process.env.DATABASE_URL = `postgresql://${u}:${p}@${host}:${port}/${database}`;
  console.info(
    "[prisma] Composed DATABASE_URL from POSTGRES_*/PG_*/DB_* / DATABASE_* env vars.",
  );
}

function logDatabaseUrlHint(): void {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    console.error(
      "[prisma] DATABASE_URL is unset. Supabase: Project Settings → Database → copy URI (postgresql://…). Optional alias: SUPABASE_DATABASE_URL.",
    );
    return;
  }
  if (!validPostgresUrl(raw)) {
    console.error(
      "[prisma] DATABASE_URL must start with postgresql:// or postgres:// — got:",
      JSON.stringify(raw.slice(0, 40)),
    );
  }
}

ensureDatabaseUrlFromAliases();
ensureDatabaseUrlFromParts();
logDatabaseUrlHint();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
