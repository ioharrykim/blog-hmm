import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { pageToFormInput, upsertPageContent } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const page = await upsertPageContent(pageToFormInput(formData));

  revalidateTag("public-pages", "max");
  revalidatePath(`/${page.slug}`);
  revalidatePath("/admin");
  return NextResponse.redirect(new URL(`/admin/pages/${page.slug}`, request.url), 303);
}
