import type { Metadata } from "next";
import { absoluteUrl, ogImageUrl, site } from "@/lib/site";

type MetaInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
};

export function pageMetadata({
  title,
  description = site.description,
  path = "/",
  image,
  type = "website"
}: MetaInput = {}): Metadata {
  const resolvedTitle = title ? `${title} | ${site.name}` : site.title;
  const url = absoluteUrl(path);
  const imageUrl = ogImageUrl(image);

  return {
    title: resolvedTitle,
    description,
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": absoluteUrl("/rss.xml")
      }
    },
    openGraph: {
      type,
      url,
      siteName: site.name,
      locale: site.locale,
      title: resolvedTitle,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: resolvedTitle }]
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [imageUrl]
    }
  };
}
