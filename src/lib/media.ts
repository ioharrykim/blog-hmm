import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { slugify } from "@/lib/slug";

const maxImageSize = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

function extensionFor(file: File) {
  const fromName = extname(file.name).toLowerCase();
  if (fromName) return fromName;
  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "image/svg+xml") return ".svg";
  return "";
}

export async function uploadImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!allowedTypes.has(file.type)) {
    throw new Error("지원하지 않는 이미지 형식입니다. jpg, png, webp, gif, svg만 업로드할 수 있습니다.");
  }
  if (file.size > maxImageSize) {
    throw new Error("이미지는 5MB 이하만 업로드할 수 있습니다.");
  }

  const safeBase = slugify(file.name.replace(/\.[^.]+$/, "") || "image");
  const filename = `${Date.now()}-${randomUUID()}-${safeBase}${extensionFor(file)}`;
  const pathname = `uploads/${filename}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(pathname, bytes, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false
    });
    return blob.url;
  }

  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), bytes);
  return `/${pathname}`;
}
