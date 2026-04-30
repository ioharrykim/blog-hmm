import Link from "next/link";
import { formatDate } from "@/lib/date";
import { getAllPosts, postMetrics } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const posts = await getAllPosts();
  const metrics = postMetrics(posts);

  return (
    <main className="admin">
      <header className="admin__head">
        <h1 className="admin__title">
          Writing, <em>quietly.</em>
        </h1>
        <div className="admin__actions">
          <Link className="button button--ghost" href="/">
            사이트 보기
          </Link>
          <Link className="button button--ghost" href="/admin/pages/about">
            About 편집
          </Link>
          <Link className="button button--ghost" href="/admin/media">
            Media
          </Link>
          <Link className="button button--primary" href="/admin/posts/new">
            새 글 →
          </Link>
          <form action="/admin/logout" method="post">
            <button className="button button--text" type="submit">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <section className="metrics" aria-label="글 통계">
        <div className="metric">
          <div className="metric__num">{metrics.published}</div>
          <div className="metric__lbl">발행</div>
        </div>
        <div className="metric">
          <div className="metric__num">{metrics.draft}</div>
          <div className="metric__lbl">초안</div>
        </div>
        <div className="metric">
          <div className="metric__num">{metrics.total}</div>
          <div className="metric__lbl">전체</div>
        </div>
        <div className="metric">
          <div className="metric__num">{metrics.chars.toLocaleString("ko-KR")}</div>
          <div className="metric__lbl">누적 글자</div>
        </div>
      </section>

      <section className="admin-list" aria-label="관리자 글 목록">
        {posts.length === 0 ? (
          <div className="empty">아직 글이 없습니다.</div>
        ) : (
          posts.map((post) => (
            <div className="admin-row" key={post.id}>
              <span className={`admin-row__state ${post.status === "published" ? "is-published" : ""}`}>
                {post.status}
              </span>
              <Link className="admin-row__title" href={`/admin/posts/${post.id}`}>
                {post.title}
                <span>/{post.slug}</span>
              </Link>
              <span className="admin-row__date">{formatDate(post.publishedAt || post.updatedAt)}</span>
              <span className="admin-row__actions">
                {post.status === "published" ? (
                  <Link className="button button--text" href={`/posts/${post.slug}`}>
                    보기
                  </Link>
                ) : null}
                <form action="/admin/posts/delete" method="post">
                  <input type="hidden" name="id" value={post.id} />
                  <button className="button button--danger" type="submit">
                    삭제
                  </button>
                </form>
              </span>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
