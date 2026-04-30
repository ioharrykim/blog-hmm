export const site = {
  name: "hmmhmm",
  author: "Hyunmin",
  title: "hmmhmm",
  description: "조용히 쓰고, 오래 남기는 개인 에세이와 생활의 기록.",
  locale: "ko_KR",
  language: "ko",
  email: "hello@hyunmin.me"
};

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://hmmhmm.vercel.app").replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalized}`;
}

export function ogImageUrl(path?: string | null) {
  if (!path) return absoluteUrl("/og-default.svg");
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return absoluteUrl(path);
}
