const stylesheet = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="/rss/channel/title" /> RSS</title>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #f7f4ee;
            --fg: #181614;
            --muted: #6e6761;
            --line: rgba(24, 22, 20, 0.14);
            --accent: #8a4f38;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #121212;
              --fg: #f2eee8;
              --muted: #a69d94;
              --line: rgba(242, 238, 232, 0.16);
              --accent: #d6a07f;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--fg);
            font: 16px/1.75 ui-serif, Georgia, "Times New Roman", serif;
          }
          main {
            width: min(860px, calc(100% - 40px));
            margin: 0 auto;
            padding: 64px 0;
          }
          .kicker {
            color: var(--muted);
            font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          h1 {
            margin: 10px 0 12px;
            font-size: clamp(38px, 7vw, 76px);
            line-height: 0.95;
            letter-spacing: 0;
          }
          .lede {
            max-width: 620px;
            margin: 0 0 36px;
            color: var(--muted);
            font-size: 18px;
          }
          .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 42px;
          }
          a {
            color: inherit;
            text-decoration-thickness: 1px;
            text-underline-offset: 4px;
          }
          .button {
            border: 1px solid var(--line);
            border-radius: 6px;
            padding: 8px 12px;
            color: var(--fg);
            text-decoration: none;
            font: 14px/1.2 ui-sans-serif, system-ui, sans-serif;
          }
          .feed {
            border-top: 1px solid var(--line);
          }
          article {
            display: grid;
            gap: 8px;
            padding: 22px 0;
            border-bottom: 1px solid var(--line);
          }
          article h2 {
            margin: 0;
            font-size: 24px;
            line-height: 1.25;
            letter-spacing: 0;
          }
          article p {
            margin: 0;
            color: var(--muted);
          }
          .meta {
            color: var(--accent);
            font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
          }
        </style>
      </head>
      <body>
        <main>
          <div class="kicker">RSS Feed</div>
          <h1><xsl:value-of select="/rss/channel/title" /></h1>
          <p class="lede">
            이 페이지는 RSS 리더가 구독할 수 있는 피드입니다. 브라우저에서도 읽기 좋게 표시하고 있습니다.
          </p>
          <div class="actions">
            <a class="button" href="/">블로그로 돌아가기</a>
            <a class="button">
              <xsl:attribute name="href"><xsl:value-of select="/rss/channel/atom:link/@href" /></xsl:attribute>
              피드 URL
            </a>
          </div>
          <section class="feed">
            <xsl:for-each select="/rss/channel/item">
              <article>
                <div class="meta"><xsl:value-of select="pubDate" /></div>
                <h2>
                  <a>
                    <xsl:attribute name="href"><xsl:value-of select="link" /></xsl:attribute>
                    <xsl:value-of select="title" />
                  </a>
                </h2>
                <p><xsl:value-of select="description" /></p>
              </article>
            </xsl:for-each>
          </section>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

export const revalidate = 3600;

export async function GET() {
  return new Response(stylesheet, {
    headers: {
      "content-type": "text/xsl; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
