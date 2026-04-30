import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="foot">
      <span>© 2026 {site.name}</span>
      <span className="foot__links">
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/rss.xml">RSS</Link>
      </span>
    </footer>
  );
}
