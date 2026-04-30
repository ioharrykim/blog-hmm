import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <div className="page__kicker">404</div>
      <h1 className="page__title">
        찾는 글이 <em>여기에 없습니다.</em>
      </h1>
      <p className="page__lede">주소가 바뀌었거나 아직 발행되지 않은 글일 수 있습니다.</p>
      <Link className="button button--primary" href="/">
        글 목록으로
      </Link>
    </main>
  );
}
