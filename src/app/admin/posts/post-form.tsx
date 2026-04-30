import { CategoryInput } from "@/app/admin/posts/category-input";
import { toInputDateTime } from "@/lib/date";
import type { Post } from "@/lib/posts";

export function PostForm({ post, categories }: { post?: Post; categories: string[] }) {
  return (
    <form className="editor-form" action="/admin/posts/save" method="post" encType="multipart/form-data">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="field field--title">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={post?.title} placeholder="제목" required />
      </div>

      <div className="field">
        <label htmlFor="excerpt">Excerpt</label>
        <textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt} rows={2} placeholder="짧은 소개 한 줄." />
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="slug">Slug</label>
          <input id="slug" name="slug" defaultValue={post?.slug} placeholder="first-note" />
        </div>
        <div className="field">
          <label>Categories</label>
          <CategoryInput initial={post?.tags || []} options={categories} />
        </div>
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={post?.status || "draft"}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="publishedAt">Published at</label>
          <input id="publishedAt" name="publishedAt" type="datetime-local" defaultValue={toInputDateTime(post?.publishedAt)} />
        </div>
      </div>

      <div className="field field--body">
        <label htmlFor="body">Markdown body</label>
        <textarea
          id="body"
          name="body"
          defaultValue={post?.body}
          placeholder="본문은 Markdown으로 작성합니다. 단락은 빈 줄로 구분하세요."
          required
        />
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="seoTitle">SEO title</label>
          <input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle} placeholder="검색 결과 제목" />
        </div>
        <div className="field">
          <label htmlFor="ogImage">OG image</label>
          <input id="ogImage" name="ogImage" defaultValue={post?.ogImage} placeholder="/og-default.svg" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="image">Image upload</label>
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" />
        <p className="field__hint">업로드하면 이 글의 OG 이미지로 저장됩니다. 본문 이미지는 Media에서 Markdown을 복사해 넣으세요.</p>
      </div>

      <div className="field">
        <label htmlFor="seoDescription">SEO description</label>
        <textarea
          id="seoDescription"
          name="seoDescription"
          rows={2}
          defaultValue={post?.seoDescription}
          placeholder="검색 결과와 공유 미리보기에 들어갈 설명"
        />
      </div>

      <p className="editor-note">
        발행 버튼을 누르면 상태가 published로 바뀌고 공개 글 페이지로 이동합니다. 저장만 누르면 관리자 화면에
        머무릅니다.
      </p>

      <div className="form-actions">
        <button className="button button--ghost" type="submit" name="intent" value="save">
          저장
        </button>
        <button className="button button--primary" type="submit" name="intent" value="publish">
          발행 →
        </button>
      </div>
    </form>
  );
}
