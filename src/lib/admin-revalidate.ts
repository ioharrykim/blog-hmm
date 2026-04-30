import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

export function revalidatePublicContent() {
  revalidateTag("public-posts", "max");
  revalidateTag("public-pages", "max");
  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/archive");
  revalidatePath("/rss.xml");
  revalidatePath("/sitemap.xml");
}
