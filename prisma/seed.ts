import { PrismaClient, Role, PostApprovalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SITE_NAME } from "../src/lib/site";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.ADMIN,
      blocked: false,
      writerApproved: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Site Admin",
      role: Role.ADMIN,
      writerApproved: true,
    },
  });

  const demoAuthor = await prisma.user.upsert({
    where: { email: "writer@example.com" },
    update: { writerApproved: true },
    create: {
      email: "writer@example.com",
      passwordHash: await bcrypt.hash("writer123", 12),
      name: "Demo Writer",
      role: Role.USER,
      writerApproved: true,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    create: {
      id: "site",
      dailyPostLimitEnabled: false,
      dailyPostLimitCount: 3,
      paymentAdsEnabled: false,
      paymentSubscriptionsEnabled: false,
    },
    update: {},
  });

  const catCulture = await prisma.category.upsert({
    where: { slug: "culture" },
    update: {},
    create: {
      slug: "culture",
      name: "Culture",
      description: "Arts, language, and community",
      sortOrder: 0,
    },
  });

  const catTech = await prisma.category.upsert({
    where: { slug: "technology" },
    update: {},
    create: {
      slug: "technology",
      name: "Technology",
      description: "Tools and ideas",
      sortOrder: 1,
    },
  });

  const welcomeBody = `# Welcome

This is **${SITE_NAME}**. Admins can draft, publish, approve submissions, and moderate from the dashboard.

## Media

Add a **cover image** (upload or URL) and **YouTube link** on each post. Writers submit from **Submit**; posts start as **Pending** until an editor sets them to **Approved**.`;

  await prisma.post.upsert({
    where: { slug: "welcome-to-the-chronicle" },
    update: {
      title: `Welcome to ${SITE_NAME}`,
      excerpt:
        "Punjabi voices, community stories, and a place to share what matters.",
      content: welcomeBody,
      approvalStatus: PostApprovalStatus.APPROVED,
      categoryId: catCulture.id,
    },
    create: {
      slug: "welcome-to-the-chronicle",
      title: `Welcome to ${SITE_NAME}`,
      excerpt:
        "Punjabi voices, community stories, and a place to share what matters.",
      content: welcomeBody,
      approvalStatus: PostApprovalStatus.APPROVED,
      coverImageUrl: null,
      youtubeUrl: null,
      categoryId: catCulture.id,
      authorId: admin.id,
    },
  });

  await prisma.post.upsert({
    where: { slug: "crafting-stories-that-move" },
    update: {
      approvalStatus: PostApprovalStatus.APPROVED,
      categoryId: catTech.id,
    },
    create: {
      slug: "crafting-stories-that-move",
      title: "Crafting Stories That Move the World",
      excerpt:
        "Thoughtful cadence, honest reporting, and room for readers to respond.",
      content: `Ideas travel fastest when they are *clear*, *kind*, and *anchored in evidence*.

Use short sections. Use pull quotes. Invite disagreement in the comments — then moderate with care.

> Great prose is not decoration. It is respect for the reader's time.`,
      approvalStatus: PostApprovalStatus.APPROVED,
      coverImageUrl: null,
      youtubeUrl: null,
      categoryId: catTech.id,
      authorId: demoAuthor.id,
    },
  });

  console.log("Seed complete. Admin login:", adminEmail, "/", adminPassword);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
