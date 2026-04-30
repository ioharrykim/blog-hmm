import { PostRow } from "@/components/post-row";
import { TagList } from "@/components/tag-list";
import { pageMetadata } from "@/lib/metadata";
import { getPublishedPosts, getPublishedTags } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata();

export default async function HomePage() {
  const posts = await getPublishedPosts();
  const tags = (await getPublishedTags()).map((item) => item.tag);

  return (
    <main className="home">
      <section className="home__intro">
        <p className="home__lede">
          조용히 쓰고,
          <br />
          <em>오래 남기는 개인 에세이.</em>
        </p>
        <TagList tags={tags} />
      </section>

      <section className="home__list" aria-label="최근 글">
        {posts.length === 0 ? <div className="empty">아직 발행된 글이 없습니다.</div> : posts.map((post) => <PostRow key={post.id} post={post} />)}
      </section>
    </main>
  );
}
