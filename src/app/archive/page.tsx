import { PostRow } from "@/components/post-row";
import { pageMetadata } from "@/lib/metadata";
import { getPublicArchives, getPublicPublishedTags } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "Archive",
  description: "hmmhmm 글 아카이브.",
  path: "/archive"
});

export default async function ArchivePage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category ? decodeURIComponent(params.category) : null;
  const archives = await getPublicArchives(selectedCategory);
  const categories = await getPublicPublishedTags();

  return (
    <main className="home">
      <section className="home__intro">
        <p className="home__lede">
          시간순으로 다시 보는 <em>기록의 목록.</em>
        </p>
        <div className="filter-list" aria-label="카테고리 필터">
          <a className={!selectedCategory ? "is-active" : ""} href="/archive">
            전체
          </a>
          {categories.map(({ tag, count }) => (
            <a
              key={tag}
              className={selectedCategory === tag ? "is-active" : ""}
              href={`/archive?category=${encodeURIComponent(tag)}`}
            >
              {tag} <span>{count}</span>
            </a>
          ))}
        </div>
      </section>
      {archives.length === 0 ? (
        <div className="empty">선택한 카테고리에 발행된 글이 없습니다.</div>
      ) : (
        archives.map((group) => (
          <section className="archive-month" key={group.month}>
            <h2 className="archive-month__title">{group.month}</h2>
            <div className="archive-list">
              {group.posts.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
