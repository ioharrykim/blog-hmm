import Link from "next/link";
import { formatDate, readingMinutes } from "@/lib/date";
import type { Post } from "@/lib/posts";

export function PostRow({ post }: { post: Post }) {
  return (
    <Link className="row" href={`/posts/${post.slug}`}>
      <span className="row__copy">
        <span className="row__title">
          <span className="row__titleIn">{post.title}</span>
        </span>
        <span className="row__excerpt">{post.excerpt}</span>
      </span>
      <span className="row__meta">
        <span>{formatDate(post.publishedAt)}</span>
        <span>{readingMinutes(post.body)}분</span>
      </span>
    </Link>
  );
}
