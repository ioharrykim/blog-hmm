import { getPublicPublishedPosts } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";
import { escapeXml } from "@/lib/xml";

export const revalidate = 300;

export async function GET() {
  const posts = await getPublicPublishedPosts();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(absoluteUrl("/"))}</link>
    <description>${escapeXml(site.description)}</description>
    <language>ko</language>
    <atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
${posts
  .map(
    (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(absoluteUrl(`/posts/${post.slug}`))}</link>
      <guid>${escapeXml(absoluteUrl(`/posts/${post.slug}`))}</guid>
      <pubDate>${new Date(post.publishedAt || post.updatedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
