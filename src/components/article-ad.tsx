"use client";

import { AdSlot } from "@/components/adsense";

export function ArticleAd() {
  return <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT} className="ad-slot--article" />;
}
