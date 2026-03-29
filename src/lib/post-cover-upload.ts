import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { PostCoverImageKind } from "@prisma/client";

export const POST_COVERS_PUBLIC_PREFIX = "/uploads/posts/";

const MAX_BYTES = 5 * 1024 * 1024;

type Detected = { ext: string };

function detectImage(buf: Buffer): Detected | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: ".jpg" };
  }
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return { ext: ".png" };
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return { ext: ".gif" };
  }
  if (
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return { ext: ".webp" };
  }
  return null;
}

export function isManagedUploadPath(url: string | null | undefined): boolean {
  if (!url || !url.startsWith(POST_COVERS_PUBLIC_PREFIX)) return false;
  const name = url.slice(POST_COVERS_PUBLIC_PREFIX.length);
  return Boolean(name && !name.includes("/") && !name.includes(".."));
}

function managedPathToAbsolute(publicUrl: string): string | null {
  if (!isManagedUploadPath(publicUrl)) return null;
  const name = publicUrl.slice(POST_COVERS_PUBLIC_PREFIX.length);
  return join(process.cwd(), "public", "uploads", "posts", name);
}

export async function deleteStoredPostCover(
  publicUrl: string | null | undefined,
): Promise<void> {
  const abs = publicUrl ? managedPathToAbsolute(publicUrl) : null;
  if (!abs) return;
  try {
    await unlink(abs);
  } catch {
    // missing file is fine
  }
}

export function coverKindForUrl(url: string | null): PostCoverImageKind {
  if (!url) return PostCoverImageKind.NONE;
  if (url.startsWith(POST_COVERS_PUBLIC_PREFIX)) {
    return PostCoverImageKind.UPLOAD;
  }
  return PostCoverImageKind.EXTERNAL;
}

export async function savePostCoverFromForm(
  formData: FormData,
  fieldName = "coverImageFile",
): Promise<{ publicUrl?: string; error?: string }> {
  const entry = formData.get(fieldName);
  if (!(entry instanceof File) || entry.size === 0) {
    return {};
  }
  if (entry.size > MAX_BYTES) {
    return { error: "Cover image must be 5MB or smaller" };
  }
  const buf = Buffer.from(await entry.arrayBuffer());
  const detected = detectImage(buf);
  if (!detected) {
    return { error: "Cover must be JPEG, PNG, GIF, or WebP" };
  }
  const name = `${randomUUID()}${detected.ext}`;
  const dir = join(process.cwd(), "public", "uploads", "posts");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), buf);
  return { publicUrl: `${POST_COVERS_PUBLIC_PREFIX}${name}` };
}

export type ResolvedPostCover =
  | { ok: false; error: string }
  | {
      ok: true;
      coverImageUrl: string | null;
      coverImageKind: PostCoverImageKind;
      fileToDelete: string | null;
    };

export async function resolvePostCoverFromForm(
  formData: FormData,
  existing: {
    coverImageUrl: string | null;
    coverImageKind: PostCoverImageKind;
  } | null,
): Promise<ResolvedPostCover> {
  const saved = await savePostCoverFromForm(formData);
  if (saved.error) return { ok: false, error: saved.error };

  const rawCoverUrl = String(formData.get("coverImageUrl") ?? "").trim();

  if (saved.publicUrl) {
    const prevPath =
      existing &&
      existing.coverImageKind === PostCoverImageKind.UPLOAD &&
      existing.coverImageUrl &&
      existing.coverImageUrl !== saved.publicUrl
        ? existing.coverImageUrl
        : null;
    return {
      ok: true,
      coverImageUrl: saved.publicUrl,
      coverImageKind: PostCoverImageKind.UPLOAD,
      fileToDelete: prevPath,
    };
  }

  if (!rawCoverUrl) {
    const prevPath =
      existing &&
      existing.coverImageKind === PostCoverImageKind.UPLOAD &&
      existing.coverImageUrl
        ? existing.coverImageUrl
        : null;
    return {
      ok: true,
      coverImageUrl: null,
      coverImageKind: PostCoverImageKind.NONE,
      fileToDelete: prevPath,
    };
  }

  const newKind = coverKindForUrl(rawCoverUrl);
  let fileToDelete: string | null = null;
  if (
    existing?.coverImageKind === PostCoverImageKind.UPLOAD &&
    existing.coverImageUrl &&
    existing.coverImageUrl !== rawCoverUrl
  ) {
    fileToDelete = existing.coverImageUrl;
  }

  return {
    ok: true,
    coverImageUrl: rawCoverUrl,
    coverImageKind: newKind,
    fileToDelete,
  };
}
