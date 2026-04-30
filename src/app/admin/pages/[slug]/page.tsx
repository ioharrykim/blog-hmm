import Link from "next/link";
import { notFound } from "next/navigation";
import { savePageAction } from "@/app/admin/actions";
import { getPageContent } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageContent(slug);
  if (!page) notFound();

  return (
    <main className="editor">
      <div className="page__kicker">Page · {page.slug}</div>
      <h1 className="page__title">페이지 편집</h1>
      <form className="editor-form" action={savePageAction}>
        <input type="hidden" name="slug" value={page.slug} />
        <div className="field">
          <label htmlFor="kicker">Kicker</label>
          <input id="kicker" name="kicker" defaultValue={page.kicker} />
        </div>
        <div className="field field--title">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={page.title} required />
        </div>
        <div className="field">
          <label htmlFor="lede">Lede</label>
          <textarea id="lede" name="lede" rows={3} defaultValue={page.lede} />
        </div>
        <div className="field field--body">
          <label htmlFor="body">Markdown body</label>
          <textarea id="body" name="body" defaultValue={page.body} required />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="seoTitle">SEO title</label>
            <input id="seoTitle" name="seoTitle" defaultValue={page.seoTitle} />
          </div>
          <div className="field">
            <label htmlFor="seoDescription">SEO description</label>
            <textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={page.seoDescription} />
          </div>
        </div>
        <div className="form-actions">
          <button className="button button--primary" type="submit">
            저장
          </button>
          <Link className="button button--ghost" href="/about">
            공개 페이지 보기
          </Link>
        </div>
      </form>
    </main>
  );
}
