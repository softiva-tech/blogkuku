import { prisma } from "@/lib/prisma";

const DEFAULT_ID = "site";

export async function getSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: DEFAULT_ID },
    create: { id: DEFAULT_ID },
    update: {},
  });
}
