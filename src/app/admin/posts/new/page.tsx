import Link from "next/link";
import { PostForm } from "@/app/admin/posts/post-form";
import { getAllCategories } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = (await getAllCategories()).map((item) => item.tag);

  return (
    <main className="editor">
      <div className="page__kicker">New post</div>
      <h1 className="page__title">
        새 글을 <em>조용히 씁니다.</em>
      </h1>
      <PostForm categories={categories} />
      <Link className="read__back" href="/admin">
        ← 대시보드
      </Link>
    </main>
  );
}
