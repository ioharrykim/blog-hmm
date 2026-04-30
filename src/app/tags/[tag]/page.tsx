import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostRow } from "@/components/post-row";
import { pageMetadata } from "@/lib/metadata";
import { getPublicPostsByTag, getPublicPublishedTags } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ tag: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return pageMetadata({
    title: `${decoded} 태그`,
    description: `${decoded} 태그로 묶인 hmmhmm의 글.`,
    path: `/tags/${encodeURIComponent(decoded)}`
  });
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const knownTags = (await getPublicPublishedTags()).map((item) => item.tag);
  if (!knownTags.includes(decoded)) notFound();

  const posts = await getPublicPostsByTag(decoded);

  return (
    <main className="home">
      <section className="home__intro">
        <p className="home__lede">
          {decoded}로 묶인 <em>{posts.length}개의 글.</em>
        </p>
      </section>
      <section className="home__list" aria-label={`${decoded} 글 목록`}>
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </section>
    </main>
  );
}
