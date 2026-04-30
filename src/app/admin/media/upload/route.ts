import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const url = await uploadImage(formData.get("image"));
  const target = url ? `/admin/media?url=${encodeURIComponent(url)}` : "/admin/media?error=1";
  return NextResponse.redirect(new URL(target, request.url), 303);
}
