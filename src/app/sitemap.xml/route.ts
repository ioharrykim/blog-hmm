import { getPublicPublishedPosts, getTagCounts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";
import { escapeXml } from "@/lib/xml";

export const revalidate = 300;

export async function GET() {
  const now = new Date().toISOString();
  const staticRoutes = ["/", "/posts", "/archive", "/about", "/privacy", "/contact"];
  const posts = await getPublicPublishedPosts();
  const tags = getTagCounts(posts);

  const urls = [
    ...staticRoutes.map((path) => ({ loc: absoluteUrl(path), lastmod: now, priority: path === "/" ? "1.0" : "0.7" })),
    ...posts.map((post) => ({
      loc: absoluteUrl(`/posts/${post.slug}`),
      lastmod: post.updatedAt,
      priority: "0.9"
    })),
    ...tags.map(({ tag }) => ({
      loc: absoluteUrl(`/archive?category=${encodeURIComponent(tag)}`),
      lastmod: now,
      priority: "0.6"
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
