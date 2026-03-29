"use server";

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { getSiteSettings } from "@/lib/site-settings";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PostApprovalStatus, PostCoverImageKind, Role } from "@prisma/client";
import { z } from "zod";
import { publicPostWhere } from "@/lib/post-live";
import {
  deleteStoredPostCover,
  resolvePostCoverFromForm,
} from "@/lib/post-cover-upload";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

function startOfUtcDay(d = new Date()) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

async function countUserPostsToday(authorId: string) {
  return prisma.post.count({
    where: {
      authorId,
      createdAt: { gte: startOfUtcDay() },
    },
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80).optional(),
});

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input" };

  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (exists) return { error: "An account with this email already exists" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      writerApproved: false,
    },
  });
  return { ok: true };
}

const postFieldsSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  slug: z.string().min(1).max(200).optional(),
  coverImageUrl: z.string().max(2000).optional(),
  youtubeUrl: z.string().max(500).optional(),
  categoryId: z.string().optional(),
});

function parsePostForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    excerpt: String(formData.get("excerpt") ?? "") || undefined,
    content: String(formData.get("content") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim(),
    youtubeUrl: String(formData.get("youtubeUrl") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? "").trim(),
  };
}

export async function createPost(formData: FormData) {
  const session = await requireAdmin();
  const raw = parsePostForm(formData);
  const statusParse = z
    .nativeEnum(PostApprovalStatus)
    .safeParse(String(formData.get("approvalStatus") ?? ""));
  const approvalStatus = statusParse.success
    ? statusParse.data
    : PostApprovalStatus.DRAFT;

  const cover = await resolvePostCoverFromForm(formData, null);
  if (!cover.ok) return { error: cover.error };

  const parsed = postFieldsSchema.safeParse({
    ...raw,
    coverImageUrl: cover.coverImageUrl || undefined,
    youtubeUrl: raw.youtubeUrl || undefined,
    categoryId: raw.categoryId || undefined,
  });
  if (!parsed.success) return { error: "Check title, content, and URLs" };

  let slug = parsed.data.slug?.trim()
    ? slugify(parsed.data.slug)
    : slugify(parsed.data.title);
  const conflict = await prisma.post.findUnique({ where: { slug } });
  if (conflict) slug = `${slug}-${Date.now().toString(36)}`;

  await prisma.post.create({
    data: {
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      slug,
      coverImageUrl: cover.coverImageUrl,
      coverImageKind: cover.coverImageKind,
      youtubeUrl: parsed.data.youtubeUrl || null,
      categoryId: parsed.data.categoryId || null,
      approvalStatus,
      authorId: session.user.id,
    },
  });
  if (cover.fileToDelete) await deleteStoredPostCover(cover.fileToDelete);
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function submitUserPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in required" };
  if (session.user.role === "ADMIN") {
    redirect("/admin/posts/new");
  }

  const author = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { writerApproved: true },
  });
  if (!author?.writerApproved) {
    return {
      error:
        "Your account is not approved to submit stories yet. An administrator must enable submissions for you.",
    };
  }

  const settings = await getSiteSettings();
  if (settings.dailyPostLimitEnabled) {
    const n = await countUserPostsToday(session.user.id);
    if (n >= settings.dailyPostLimitCount) {
      return {
        error: `Daily post limit reached (${settings.dailyPostLimitCount} per day).`,
      };
    }
  }

  const raw = parsePostForm(formData);
  const cover = await resolvePostCoverFromForm(formData, null);
  if (!cover.ok) return { error: cover.error };

  const parsed = postFieldsSchema.safeParse({
    ...raw,
    coverImageUrl: cover.coverImageUrl || undefined,
    youtubeUrl: raw.youtubeUrl || undefined,
    categoryId: raw.categoryId || undefined,
  });
  if (!parsed.success) return { error: "Check title, content, and URLs" };

  let slug = slugify(parsed.data.title);
  const conflict = await prisma.post.findUnique({ where: { slug } });
  if (conflict) slug = `${slug}-${Date.now().toString(36)}`;

  await prisma.post.create({
    data: {
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      slug,
      coverImageUrl: cover.coverImageUrl,
      coverImageKind: cover.coverImageKind,
      youtubeUrl: parsed.data.youtubeUrl || null,
      categoryId: parsed.data.categoryId || null,
      approvalStatus: PostApprovalStatus.PENDING,
      authorId: session.user.id,
    },
  });
  if (cover.fileToDelete) await deleteStoredPostCover(cover.fileToDelete);
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  revalidatePath("/submit");
  return { ok: true };
}

export async function updatePost(postId: string, formData: FormData) {
  await requireAdmin();
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) return { error: "Post not found" };

  const raw = parsePostForm(formData);
  const statusParse = z
    .nativeEnum(PostApprovalStatus)
    .safeParse(String(formData.get("approvalStatus") ?? ""));
  const approvalStatus = statusParse.success
    ? statusParse.data
    : PostApprovalStatus.DRAFT;

  const cover = await resolvePostCoverFromForm(formData, {
    coverImageUrl: existing.coverImageUrl,
    coverImageKind: existing.coverImageKind,
  });
  if (!cover.ok) return { error: cover.error };

  const parsed = postFieldsSchema.safeParse({
    ...raw,
    coverImageUrl: cover.coverImageUrl || undefined,
    youtubeUrl: raw.youtubeUrl || undefined,
    categoryId: raw.categoryId || undefined,
  });
  if (!parsed.success) return { error: "Check title, content, and URLs" };

  let slug = parsed.data.slug?.trim()
    ? slugify(parsed.data.slug)
    : slugify(parsed.data.title);
  const other = await prisma.post.findFirst({
    where: { slug, NOT: { id: postId } },
  });
  if (other) slug = `${slug}-${Date.now().toString(36)}`;

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      slug,
      coverImageUrl: cover.coverImageUrl,
      coverImageKind: cover.coverImageKind,
      youtubeUrl: parsed.data.youtubeUrl || null,
      categoryId: parsed.data.categoryId || null,
      approvalStatus,
    },
  });
  if (cover.fileToDelete) await deleteStoredPostCover(cover.fileToDelete);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function setPostApprovalStatus(
  postId: string,
  approvalStatus: PostApprovalStatus,
  _formData?: FormData,
) {
  await requireAdmin();
  await prisma.post.update({
    where: { id: postId },
    data: { approvalStatus },
  });
  const p = await prisma.post.findUnique({ where: { id: postId } });
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  if (p) revalidatePath(`/blog/${p.slug}`);
  return { ok: true };
}

export async function deletePost(postId: string, _formData?: FormData) {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post) {
    await prisma.post.delete({ where: { id: postId } });
    if (
      post.coverImageKind === PostCoverImageKind.UPLOAD &&
      post.coverImageUrl
    ) {
      await deleteStoredPostCover(post.coverImageUrl);
    }
  }
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  return { ok: true };
}

const commentSchema = z.object({
  body: z.string().min(1).max(5000),
});

export async function addComment(postId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to comment" };

  const parsed = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { error: "Comment cannot be empty" };

  const post = await prisma.post.findFirst({
    where: { id: postId, ...publicPostWhere },
  });
  if (!post) return { error: "Post not found" };

  await prisma.comment.create({
    data: {
      body: parsed.data.body,
      postId,
      userId: session.user.id,
      approved: true,
    },
  });
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true };
}

export async function setCommentApproved(
  commentId: string,
  approved: boolean,
  _formData?: FormData,
) {
  await requireAdmin();
  await prisma.comment.update({
    where: { id: commentId },
    data: { approved },
  });
  revalidatePath("/admin/comments");
  const c = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: true },
  });
  if (c?.post) revalidatePath(`/blog/${c.post.slug}`);
  return { ok: true };
}

export async function deleteComment(commentId: string, _formData?: FormData) {
  await requireAdmin();
  const c = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: true },
  });
  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath("/admin/comments");
  if (c?.post) revalidatePath(`/blog/${c.post.slug}`);
  return { ok: true };
}

const roleSchema = z.nativeEnum(Role);

export async function updateUserRoleAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const parsed = roleSchema.safeParse(formData.get("role"));
  if (!parsed.success || !userId) return { error: "Invalid input" };

  const session = await auth();
  if (session?.user?.id === userId) return { error: "Cannot change your own role here" };

  await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserBlocked(
  userId: string,
  blocked: boolean,
  _formData?: FormData,
) {
  await requireAdmin();
  const session = await auth();
  if (session?.user?.id === userId) return { error: "Cannot block yourself" };

  await prisma.user.update({
    where: { id: userId },
    data: {
      blocked,
      blockedReason: blocked ? "Blocked by administrator" : null,
    },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserWriterApproved(
  userId: string,
  writerApproved: boolean,
  _formData?: FormData,
) {
  await requireAdmin();
  const session = await auth();
  if (session?.user?.id === userId) {
    return { error: "Use another admin account to change your own submission access." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { writerApproved },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function adminSetUserPassword(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("newPassword") ?? "");
  if (!userId || password.length < 8) return { error: "User and password required (min 8)" };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function impersonateUserAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const session = await auth();
  if (!userId || session?.user?.id === userId) redirect("/admin/users");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.blocked) redirect("/admin/users");

  const token = randomBytes(24).toString("hex");
  await prisma.impersonationToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  redirect(`/auth/impersonate?token=${encodeURIComponent(token)}`);
}

export async function deleteUser(userId: string, _formData?: FormData) {
  await requireAdmin();
  const session = await auth();
  if (session?.user?.id === userId) return { error: "Cannot delete yourself" };

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    select: { coverImageUrl: true, coverImageKind: true },
  });
  await prisma.user.delete({ where: { id: userId } });
  for (const p of posts) {
    if (p.coverImageKind === PostCoverImageKind.UPLOAD && p.coverImageUrl) {
      await deleteStoredPostCover(p.coverImageUrl);
    }
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return { error: "Invalid category" };

  let slug = parsed.data.slug?.trim()
    ? slugify(parsed.data.slug)
    : slugify(parsed.data.name);
  const conflict = await prisma.category.findUnique({ where: { slug } });
  if (conflict) slug = `${slug}-${Date.now().toString(36)}`;

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      sortOrder: parsed.data.sortOrder,
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/blog");
  redirect("/admin/categories");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return { error: "Invalid category" };

  let slug = parsed.data.slug?.trim()
    ? slugify(parsed.data.slug)
    : slugify(parsed.data.name);
  const other = await prisma.category.findFirst({
    where: { slug, NOT: { id: categoryId } },
  });
  if (other) slug = `${slug}-${Date.now().toString(36)}`;

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      sortOrder: parsed.data.sortOrder,
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/blog");
  redirect("/admin/categories");
}

export async function deleteCategory(categoryId: string, _formData?: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
  revalidatePath("/blog");
  return { ok: true };
}

function formCheckboxOn(formData: FormData, name: string): boolean {
  return (
    formData.get(name) === "on" || formData.get(name) === "true"
  );
}

/** Accepts full URLs or host-only; stores normalized http(s) URL or null. */
function normalizeSocialUrl(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  const promoMetaTitle =
    String(formData.get("promoMetaTitle") ?? "").trim() || null;
  const promoMetaDescription =
    String(formData.get("promoMetaDescription") ?? "").trim() || null;
  const promoKeywords =
    String(formData.get("promoKeywords") ?? "").trim() || null;
  const promoOgImageUrl =
    String(formData.get("promoOgImageUrl") ?? "").trim() || null;
  const socialFacebookUrl = normalizeSocialUrl(formData.get("socialFacebookUrl"));
  const socialInstagramUrl = normalizeSocialUrl(
    formData.get("socialInstagramUrl"),
  );
  const socialWhatsAppUrl = normalizeSocialUrl(formData.get("socialWhatsAppUrl"));

  const gatewayFlags = {
    paymentStripeEnabled: formCheckboxOn(formData, "paymentStripeEnabled"),
    paymentRazorpayEnabled: formCheckboxOn(formData, "paymentRazorpayEnabled"),
    paymentGooglePayEnabled: formCheckboxOn(
      formData,
      "paymentGooglePayEnabled",
    ),
    paymentPaytmEnabled: formCheckboxOn(formData, "paymentPaytmEnabled"),
    paymentPayPhoneEnabled: formCheckboxOn(formData, "paymentPayPhoneEnabled"),
    paymentPayPalEnabled: formCheckboxOn(formData, "paymentPayPalEnabled"),
  };

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    create: {
      id: "site",
      dailyPostLimitEnabled: formCheckboxOn(
        formData,
        "dailyPostLimitEnabled",
      ),
      dailyPostLimitCount: Math.max(
        1,
        Math.min(100, Number(formData.get("dailyPostLimitCount")) || 3),
      ),
      paymentAdsEnabled: formCheckboxOn(formData, "paymentAdsEnabled"),
      paymentSubscriptionsEnabled: formCheckboxOn(
        formData,
        "paymentSubscriptionsEnabled",
      ),
      ...gatewayFlags,
      promoMetaTitle,
      promoMetaDescription,
      promoKeywords,
      promoOgImageUrl,
      socialFacebookUrl,
      socialInstagramUrl,
      socialWhatsAppUrl,
    },
    update: {
      dailyPostLimitEnabled: formCheckboxOn(
        formData,
        "dailyPostLimitEnabled",
      ),
      dailyPostLimitCount: Math.max(
        1,
        Math.min(100, Number(formData.get("dailyPostLimitCount")) || 3),
      ),
      paymentAdsEnabled: formCheckboxOn(formData, "paymentAdsEnabled"),
      paymentSubscriptionsEnabled: formCheckboxOn(
        formData,
        "paymentSubscriptionsEnabled",
      ),
      ...gatewayFlags,
      promoMetaTitle,
      promoMetaDescription,
      promoKeywords,
      promoOgImageUrl,
      socialFacebookUrl,
      socialInstagramUrl,
      socialWhatsAppUrl,
    },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/submit");
  revalidatePath("/advertise");
  revalidatePath("/subscribe");
  revalidatePath("/", "layout");
  redirect("/admin/settings");
}
