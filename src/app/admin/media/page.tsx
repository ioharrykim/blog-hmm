import { uploadMediaAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function MediaPage({
  searchParams
}: {
  searchParams: Promise<{ url?: string; error?: string }>;
}) {
  const params = await searchParams;
  const markdown = params.url ? `![image](${params.url})` : "";

  return (
    <main className="editor">
      <div className="page__kicker">Media</div>
      <h1 className="page__title">이미지 업로드</h1>
      <form className="editor-form" action={uploadMediaAction} encType="multipart/form-data">
        <div className="field">
          <label htmlFor="image">Image</label>
          <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" required />
          <p className="field__hint">
            로컬에서는 <code>public/uploads</code>에 저장되고, 배포 환경에서 <code>BLOB_READ_WRITE_TOKEN</code>이 있으면
            Vercel Blob에 저장됩니다.
          </p>
        </div>
        {params.error ? <p className="form-error">업로드할 이미지를 선택해주세요.</p> : null}
        <button className="button button--primary" type="submit">
          업로드 →
        </button>
      </form>

      {params.url ? (
        <section className="page__section">
          <h2>Uploaded URL</h2>
          <p>
            <a href={params.url}>{params.url}</a>
          </p>
          <div className="field">
            <label>Markdown</label>
            <input readOnly value={markdown} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
