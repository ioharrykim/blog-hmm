import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/admin-revalidate";
import { deletePost } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const id = String(formData.get("id") || "");
  if (id) await deletePost(id);

  revalidatePublicContent();
  revalidatePath("/admin");
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
