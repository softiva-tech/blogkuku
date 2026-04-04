import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/** Log once if env is wrong — Prisma still throws on first query until fixed in hPanel. */
function logDatabaseUrlHint(): void {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    console.error(
      "[prisma] DATABASE_URL is unset. In Hostinger: Website → Environment variables, set DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DB_NAME",
    );
    return;
  }
  if (!raw.startsWith("mysql://")) {
    console.error(
      "[prisma] DATABASE_URL must start with mysql:// (Prisma MySQL datasource). Current value starts with:",
      JSON.stringify(raw.slice(0, 24)),
      "— fix in Hostinger env (no leading spaces; use mysql:// not mysqli:// or a bare hostname).",
    );
  }
}
logDatabaseUrlHint();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
