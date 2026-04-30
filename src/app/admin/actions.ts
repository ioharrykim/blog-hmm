"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/admin/login/actions";
import { uploadImage } from "@/lib/media";
import { deletePost, pageToFormInput, postToFormInput, upsertPageContent, upsertPost } from "@/lib/posts";

function revalidatePublic() {
  updateTag("public-posts");
  updateTag("public-pages");
  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/archive");
  revalidatePath("/rss.xml");
  revalidatePath("/sitemap.xml");
}

export async function savePostAction(formData: FormData) {
  const input = postToFormInput(formData);
  const uploadedImage = await uploadImage(formData.get("image"));
  if (uploadedImage) input.ogImage = uploadedImage;

  const post = await upsertPost(input);
  revalidatePublic();
  revalidatePath("/admin");
  revalidatePath(`/posts/${post.slug}`);

  if (String(formData.get("intent")) === "publish") {
    redirect(`/posts/${post.slug}`);
  }

  redirect(`/admin/posts/${post.id}`);
}

export async function deletePostAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (id) await deletePost(id);
  revalidatePublic();
  revalidatePath("/admin");
  redirect("/admin");
}

export async function savePageAction(formData: FormData) {
  const page = await upsertPageContent(pageToFormInput(formData));
  updateTag("public-pages");
  revalidatePath(`/${page.slug}`);
  revalidatePath("/admin");
  redirect(`/admin/pages/${page.slug}`);
}

export async function uploadMediaAction(formData: FormData) {
  const url = await uploadImage(formData.get("image"));
  if (!url) redirect("/admin/media?error=1");
  redirect(`/admin/media?url=${encodeURIComponent(url)}`);
}

export { logoutAction };
