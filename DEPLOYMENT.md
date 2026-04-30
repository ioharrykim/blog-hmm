# hmmhmm 무료 시작/운영/호스팅 가이드

가격 확인일: 2026-04-30

## 목표

처음에는 **도메인 구매 비용만 지출**하고, 앱/DB/이미지 저장소는 무료 한도 안에서 시작합니다. 방문자가 늘거나 광고/상업 운영을 본격화하면 Vercel Pro, Neon Launch, Vercel Blob 유료 사용으로 단계적으로 전환합니다.

## 추천 구성

- **Frontend/App:** Vercel Hobby에서 시작합니다. 개인/비상업 블로그 초기 운영에는 무료 한도가 넉넉합니다.
- **Database:** 운영에서는 로컬 SQLite를 쓰지 않고 Neon Free Postgres를 연결합니다. 로컬 SQLite는 개발 편의용입니다.
- **Images:** Vercel Blob Hobby 무료 한도 안에서 시작합니다. 이미지는 너무 큰 원본을 그대로 올리지 말고 본문 폭에 맞게 줄여 올립니다.
- **Secrets:** `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`은 Vercel Project Environment Variables에만 둡니다.
- **Domain:** Vercel Domains에서 새 도메인을 검색/구매합니다. 구매한 도메인은 같은 Vercel 계정 안에서 프로젝트에 바로 연결할 수 있습니다.

## 무료 시작 기준

| 항목 | 시작 선택 | 월비용 | 주의점 |
| --- | --- | ---: | --- |
| Vercel 앱 호스팅 | Hobby | $0 | 비상업 개인 프로젝트용입니다. 광고/수익화를 시작하면 Pro 전환을 잡습니다. |
| 도메인 | Vercel에서 구매 | 도메인별 상이 | `.com`, `.me`, premium 여부에 따라 연 단위 가격이 다릅니다. |
| DB | Neon Free | $0 | 100 CU-hours/month/project, 0.5 GB storage/project 한도입니다. |
| 이미지 | Vercel Blob Hobby | $0 | 1 GB storage, 10 GB data transfer 등 무료 한도 초과 시 과금이 아니라 제한이 걸릴 수 있습니다. |
| 분석 | Vercel Web Analytics Hobby | $0 | 50,000 events/month 한도입니다. |
| 검색 등록 | Google Search Console | $0 | 도메인 소유권 인증 필요. |

## 언제 유료 전환할까

| 신호 | 권장 전환 |
| --- | --- |
| AdSense를 실제로 켜거나 제휴/광고 수익을 받기 시작함 | Vercel Pro |
| Vercel Hobby usage limit 경고 메일이 반복됨 | Vercel Pro |
| Neon Free의 CU-hours/storage가 자주 부족함 | Neon Launch |
| Blob storage 1 GB 또는 data transfer 10 GB에 가까워짐 | Vercel Pro 또는 이미지 최적화 후 전환 |
| 월 10만 PV 이상으로 안정 운영이 중요해짐 | Vercel Pro + Neon Launch |
| 월 100만 PV 이상 | 캐시/이미지/DB 튜닝 후 비용 모니터링 필수 |

글 중심 블로그 기준의 대략적인 유료 전환 후 예산은 다음처럼 봅니다. 페이지뷰당 Vercel 전송 0.35 MB, Blob 이미지 전송 0.35 MB, Edge Request 4회, DB는 읽기 위주의 가벼운 부하로 가정했습니다.

| 월 페이지뷰 | 예상 월비용 |
| --- | ---: |
| 1만-10만 | $0-$35 |
| 10만-100만 | $35-$85 |
| 100만-500만 | $180-$450 |
| 500만-1,000만 | $500-$1,100+ |

참고 단가:

- Vercel Pro는 월 $20부터이고 Pro에는 $20 사용 크레딧, 1 TB Fast Data Transfer, 1,000만 Edge Requests 같은 큰 포함량이 있습니다. 초과 Fast Data Transfer는 $0.15/GB부터, Edge Request는 $2/100만 회부터입니다.
- Vercel Blob은 Pro에서 사용량 과금입니다. 공식 예시는 50 GB 저장, 350 GB Blob 전송, 250만 다운로드 조건에서 약 $15.73/월입니다. 공개 이미지 전달은 Blob Data Transfer와 cache miss 시 Fast Origin Transfer가 핵심입니다.
- Neon Free는 프로젝트당 100 CU-hours와 0.5 GB storage를 제공합니다. Launch는 사용량 기반이고 공식 예시의 typical spend는 약 $15/월, 단가는 $0.106/CU-hour, storage $0.35/GB-month입니다.

공식 가격 페이지:

- Vercel Pricing: https://vercel.com/pricing
- Vercel Blob Pricing: https://vercel.com/docs/vercel-blob/usage-and-pricing
- Postgres on Vercel: https://vercel.com/docs/postgres
- Neon Pricing: https://neon.com/pricing

## 배포 절차

1. GitHub 저장소를 만들고 현재 프로젝트를 push합니다.
2. Vercel Dashboard에서 **New Project**를 만들고 GitHub 저장소를 import합니다.
3. Framework는 Next.js로 자동 감지되게 두고, Build Command는 `npm run build`, Install Command는 `npm install`로 둡니다.
4. 처음 배포는 무료 Hobby 프로젝트로 진행합니다. 이때 아직 `DATABASE_URL`이 없으면 배포 후 Admin 저장이 제대로 유지되지 않으므로, Neon Free 연결까지 같은 날 끝내는 것을 권장합니다.
5. Neon Console 또는 Vercel Marketplace에서 Neon Free Postgres를 만들고 `DATABASE_URL`을 Vercel 프로젝트 환경 변수에 넣습니다.
6. Vercel Blob Store를 만들고 `BLOB_READ_WRITE_TOKEN`을 Vercel 프로젝트 환경 변수에 넣습니다.
7. Project Settings > Environment Variables에 나머지 운영 변수를 입력합니다.
8. Production Deploy를 다시 실행합니다.
9. Vercel Domains에서 새 도메인을 검색하고 구매합니다.
10. 구매한 도메인을 Project Settings > Domains에서 현재 프로젝트에 연결합니다.

## Neon 설정 상세

현재 Neon 첫 프로젝트 생성 화면에서는 아래처럼 선택합니다.

- **Project name:** `blog-hmm` 또는 `hmmhmm-production`
- **Postgres version:** `17`
- **Region:** 한국 방문자가 주 대상이면 Tokyo/Seoul 계열이 보일 때 그쪽을 고릅니다. 현재 화면처럼 Singapore만 보이면 `AWS Asia Pacific 1 (Singapore)`로 시작해도 충분합니다.
- **Neon Auth:** 끕니다. 이 블로그는 이미 `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` 기반의 관리자 로그인을 가지고 있어서 Neon Auth가 필요하지 않습니다.

프로젝트를 만든 뒤:

1. Neon 프로젝트 Dashboard에서 **Connect**를 누릅니다.
2. Branch는 `production`, Database는 기본 `neondb`, Role은 기본 owner role을 선택합니다.
3. Vercel/Serverless 환경이므로 **Connection pooling**을 켭니다. 복사한 URL의 host에 `-pooler`가 들어가 있으면 pooled connection string입니다.
4. connection string은 `postgresql://...?...sslmode=require` 형태여야 합니다.
5. Vercel Project Settings > Environment Variables에 `DATABASE_URL`로 추가합니다.
6. Environment는 최소 `Production`을 선택합니다. Preview 배포에서도 관리자 기능을 테스트하고 싶으면 `Preview`도 함께 선택합니다.
7. 환경변수 추가 후 기존 배포에는 자동 적용되지 않으므로 **Deployments > 최신 배포 > Redeploy**를 실행합니다.

이 앱은 별도 migration 명령이 없습니다. 배포 후 첫 요청이 들어오면 `posts`, `pages` 테이블과 기본 샘플 글/About 데이터를 자동 생성합니다. 확인은 `/admin` 로그인 후 글을 하나 저장하고 새로고침해도 그대로 남는지 보면 됩니다.

## Vercel Blob 설정 상세

1. Vercel 프로젝트 Dashboard에서 **Storage** 탭으로 갑니다.
2. **Create Database** 또는 **Create Store**에서 **Blob**을 선택합니다.
3. 블로그 본문 이미지는 공개 이미지이므로 Public Blob Store로 시작합니다.
4. Store name은 `blog-hmm-media`처럼 짓습니다.
5. 연결할 환경은 `Production`을 선택합니다. Preview에서도 업로드 테스트를 하고 싶으면 `Preview`도 선택합니다.
6. 같은 Vercel 프로젝트에 Blob을 만들면 `BLOB_READ_WRITE_TOKEN` 환경변수가 자동으로 추가됩니다.
7. 환경변수 추가 후 다시 Redeploy합니다.
8. `/admin/media`에서 5 MB 이하의 jpg, png, webp, gif, svg 파일을 업로드해 URL이 나오는지 확인합니다.

## 필수 환경 변수

- `NEXT_PUBLIC_SITE_URL=https://구매한도메인`
- `ADMIN_USERNAME=원하는_관리자_ID`
- `ADMIN_PASSWORD=강한_비밀번호`
- `ADMIN_SESSION_SECRET=openssl rand -hex 32` 등으로 만든 긴 랜덤 문자열
- `DATABASE_URL=Neon에서_발급한_연결문자열`
- `BLOB_READ_WRITE_TOKEN=Vercel_Blob_토큰`

선택 변수:

- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=Search Console verification 값`
- `NEXT_PUBLIC_ADSENSE_ENABLED=true`
- `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-...`
- `NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT=...`

## Vercel에서 새 도메인 구매

1. Vercel Dashboard에서 **Domains**로 이동합니다.
2. 원하는 이름을 검색합니다. 예: `hmmhmm.blog`, `hmmhmm.me`, `hmmhmm.kr`처럼 여러 후보를 봅니다.
3. Premium 배지가 붙은 도메인은 비쌀 수 있으므로 처음에는 일반 가격의 도메인을 고릅니다.
4. 결제합니다. 도메인은 보통 월 결제가 아니라 연 단위 결제입니다.
5. 구매 후 도메인 상세 화면에서 현재 프로젝트에 연결합니다.
6. `www`도 함께 연결하고, canonical은 apex 또는 `www` 중 하나로 통일합니다. 이 프로젝트는 `NEXT_PUBLIC_SITE_URL` 값을 canonical 기준으로 씁니다.

Vercel에서 구매한 도메인은 DNS 설정이 가장 단순합니다. 외부 등록기관에서 산 도메인처럼 A/CNAME 레코드를 직접 만질 일이 줄어듭니다. DNS 전파는 수 분에서 최대 48시간까지 걸릴 수 있습니다.

적용 후 다음 주소를 확인합니다.

- `https://구매한도메인`
- `https://www.구매한도메인`
- `https://구매한도메인/sitemap.xml`
- `https://구매한도메인/rss.xml`
- `https://구매한도메인/robots.txt`

## 운영 방법

- 관리자 진입은 내비게이션에 노출하지 않습니다. 공개 페이지에서 숨겨진 커맨드 `quietnoise`를 입력하면 `/admin/login`으로 이동합니다.
- 글 작성/수정/삭제, 초안/발행, 카테고리, About 내용, 이미지 업로드는 Admin에서 관리합니다.
- 글을 발행한 뒤 Google Search Console에서 URL 검사를 요청하면 초기 색인 속도를 높일 수 있습니다.
- AdSense는 승인 전에는 `NEXT_PUBLIC_ADSENSE_ENABLED`를 켜지 않습니다. 승인 후 `public/ads.txt`의 publisher id를 실제 값으로 바꾸고 다시 배포합니다. 광고 수익을 받기 시작하면 Vercel Hobby의 비상업 제한 때문에 Pro 전환을 계획합니다.
- 월 1회 `npm outdated`, `npm run typecheck`, `npm run build`를 실행하고 작은 dependency update부터 반영합니다.
- Neon Console에서 storage, CU-hours, slow query를 확인하고, Vercel Usage에서 Fast Data Transfer, Edge Requests, Blob Data Transfer를 봅니다.
- 비용 폭주 방지를 위해 Vercel Spend Management에서 알림과 hard limit를 설정합니다.

## 트래픽이 늘 때의 우선순위

1. 이미지 폭을 본문 최대폭에 맞게 줄이고, 필요 이상으로 큰 원본을 업로드하지 않습니다.
2. 글 목록/상세 페이지에 `revalidate` 또는 태그 기반 캐시를 적용해 DB 읽기와 Function 실행을 줄입니다.
3. 인기 글의 OG 이미지와 본문 이미지를 압축하고, 대형 이미지는 별도 썸네일을 둡니다.
4. Neon connection pooling을 사용하고, tag/status/publishedAt/slug 인덱스를 유지합니다.
5. 월 500만 PV 이상에서는 Vercel Enterprise 또는 별도 CDN/이미지 최적화 전략을 비교합니다.

## 문제 해결

### `This page couldn't load` 또는 `CONNECT_TIMEOUT`

Vercel Runtime Logs에 `write CONNECT_TIMEOUT ...neon.tech:5432`가 보이면 앱 서버가 Neon Postgres에 접속하지 못한 것입니다.

확인 순서:

1. Vercel Project Settings > Environment Variables에서 `DATABASE_URL`이 `Production`에 들어가 있는지 확인합니다.
2. 값 앞뒤에 따옴표나 공백이 없는지 확인합니다.
3. Neon Dashboard > Connect에서 URL을 다시 복사합니다.
4. pooled URL이 계속 타임아웃되면 초기에는 direct URL, 즉 host에 `-pooler`가 없는 connection string으로 바꿔 테스트합니다.
5. Neon 프로젝트가 삭제/일시정지/권한 제한 상태가 아닌지 확인합니다.
6. 환경변수 변경 후에는 반드시 Vercel에서 Redeploy합니다.

`BLOB_READ_WRITE_TOKEN`이 없어도 메인 화면은 떠야 합니다. 이 값은 `/admin/media` 이미지 업로드에 필요합니다.
