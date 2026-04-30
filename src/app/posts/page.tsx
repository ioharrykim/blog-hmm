import { PostRow } from "@/components/post-row";
import { pageMetadata } from "@/lib/metadata";
import { getPublicPublishedPosts } from "@/lib/posts";

export const revalidate = 300;
export const metadata = pageMetadata({
  title: "Writing",
  description: "hmmhmm에 발행된 개인 에세이 목록.",
  path: "/posts"
});

export default async function PostsPage() {
  const posts = await getPublicPublishedPosts();

  return (
    <main className="home">
      <section className="home__intro">
        <p className="home__lede">
          최근에 발행한 <em>글의 목록.</em>
        </p>
      </section>
      <section className="home__list" aria-label="글 목록">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </section>
    </main>
  );
}
