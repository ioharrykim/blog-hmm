import { Markdown } from "@/components/markdown";
import { pageMetadata } from "@/lib/metadata";
import { getPublicPageContent } from "@/lib/posts";

export const revalidate = 300;

export async function generateMetadata() {
  const page = await getPublicPageContent("about");
  return pageMetadata({
    title: page?.seoTitle || "About",
    description: page?.seoDescription || "hmmhmm과 글쓴이 Hyunmin에 대하여.",
    path: "/about"
  });
}

export default async function AboutPage() {
  const page = await getPublicPageContent("about");

  return (
    <main className="page">
      <div className="page__kicker">{page?.kicker || "About · Hyunmin"}</div>
      <h1 className="page__title">{page?.title || "조용한 화면에 느린 글을 둡니다."}</h1>
      <p className="page__lede">{page?.lede}</p>
      <Markdown body={page?.body || ""} />
    </main>
  );
}
