import Link from "next/link";

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="tag-list" aria-label="카테고리">
      {tags.map((tag) => (
        <Link href={`/archive?category=${encodeURIComponent(tag)}`} key={tag} prefetch={false}>
          {tag}
        </Link>
      ))}
    </div>
  );
}
