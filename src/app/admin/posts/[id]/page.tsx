import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "@/app/admin/posts/post-form";
import { getAllCategories, getPostById } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();
  const categories = (await getAllCategories()).map((item) => item.tag);

  return (
    <main className="editor">
      <div className="page__kicker">{post.status} · Edit post</div>
      <h1 className="page__title">
        문장을 <em>다시 고칩니다.</em>
      </h1>
      <PostForm post={post} categories={categories} />
      <div className="form-actions">
        <Link className="read__back" href="/admin">
          ← 대시보드
        </Link>
        {post.status === "published" ? (
          <Link className="read__back" href={`/posts/${post.slug}`}>
            공개 글 보기 →
          </Link>
        ) : null}
      </div>
    </main>
  );
}
