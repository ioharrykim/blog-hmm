import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "hmmhmm 개인정보 처리방침.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return (
    <main className="page">
      <div className="page__kicker">Privacy · 2026.04.29</div>
      <h1 className="page__title">개인정보 처리방침</h1>
      <p className="page__lede">
        hmmhmm은 개인 블로그 운영에 필요한 최소한의 정보만 다루며, 광고와 분석 도구는 명확한 목적 안에서
        사용합니다.
      </p>

      <section className="page__section">
        <h2>수집하는 정보</h2>
        <p>
          기본적인 접속 로그, 브라우저 정보, 방문 페이지 같은 기술 정보가 호스팅 및 분석 도구를 통해 처리될 수
          있습니다. 별도의 회원가입이나 댓글 기능은 기본적으로 제공하지 않습니다.
        </p>
      </section>

      <section className="page__section">
        <h2>광고와 쿠키</h2>
        <p>
          AdSense가 활성화되면 Google 및 제휴사는 광고 제공과 측정을 위해 쿠키를 사용할 수 있습니다. 광고는
          본문 읽기를 방해하지 않는 위치에만 배치합니다.
        </p>
      </section>

      <section className="page__section">
        <h2>문의</h2>
        <p>
          개인정보와 사이트 운영에 관한 문의는 <a href={`mailto:${site.email}`}>{site.email}</a>로 보낼 수
          있습니다.
        </p>
      </section>
    </main>
  );
}
