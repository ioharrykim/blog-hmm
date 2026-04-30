import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/admin-revalidate";
import { uploadImage } from "@/lib/media";
import { postToFormInput, upsertPost } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const input = postToFormInput(formData);
  const uploadedImage = await uploadImage(formData.get("image"));
  if (uploadedImage) input.ogImage = uploadedImage;

  const post = await upsertPost(input);
  revalidatePublicContent();
  revalidatePath("/admin");
  revalidatePath(`/posts/${post.slug}`);

  const target = String(formData.get("intent")) === "publish" ? `/posts/${post.slug}` : `/admin/posts/${post.id}`;
  return NextResponse.redirect(new URL(target, request.url), 303);
}
