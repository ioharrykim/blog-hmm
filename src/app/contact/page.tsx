import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description: "hmmhmm 연락처.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <main className="page">
      <div className="page__kicker">Contact</div>
      <h1 className="page__title">
        필요한 이야기는 <em>메일로 남겨주세요.</em>
      </h1>
      <p className="page__lede">
        글에 대한 의견, 정정 요청, 협업 제안은 아래 주소로 받을 수 있습니다. 답장이 필요한 메일에는 가능한
        천천히, 그러나 놓치지 않고 답하려고 합니다.
      </p>
      <section className="page__section">
        <h2>Email</h2>
        <p>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </section>
    </main>
  );
}
