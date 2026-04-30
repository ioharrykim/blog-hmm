import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleAd } from "@/components/article-ad";
import { Markdown } from "@/components/markdown";
import { TagList } from "@/components/tag-list";
import { formatDate, readingMinutes } from "@/lib/date";
import { pageMetadata } from "@/lib/metadata";
import { getPublicPostBySlug, getPublicPublishedPosts } from "@/lib/posts";
import { absoluteUrl, ogImageUrl, site } from "@/lib/site";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getPublicPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(decodeURIComponent(slug));
  if (!post) return pageMetadata({ title: "글을 찾을 수 없습니다", path: `/posts/${slug}` });

  return pageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/posts/${post.slug}`,
    image: post.ogImage,
    type: "article"
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(decodeURIComponent(slug));
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: [ogImageUrl(post.ogImage)],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: site.author,
      url: absoluteUrl("/about")
    },
    publisher: {
      "@type": "Person",
      name: site.author,
      url: absoluteUrl("/")
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/posts/${post.slug}`)
    }
  };

  return (
    <article className="read">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="read__meta">
        {formatDate(post.publishedAt)} — {readingMinutes(post.body)}분 · {post.tags.join(", ")}
      </div>
      <h1 className="read__title">{post.title}</h1>
      <p className="read__excerpt">{post.excerpt}</p>
      <Markdown body={post.body} />
      <TagList tags={post.tags} />
      <ArticleAd />
      <Link className="read__back" href="/">
        ← 목록으로
      </Link>
    </article>
  );
}
