import { absoluteUrl, siteUrl } from "@/lib/site";

export const revalidate = 3600;

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "",
    `Host: ${siteUrl()}`,
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    ""
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
