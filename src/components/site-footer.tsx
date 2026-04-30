import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="foot">
      <span>© 2026 {site.name}</span>
      <span className="foot__links">
        <Link href="/privacy" prefetch={false}>
          Privacy
        </Link>
        <Link href="/contact" prefetch={false}>
          Contact
        </Link>
        <Link href="/rss.xml" prefetch={false}>
          RSS
        </Link>
      </span>
    </footer>
  );
}
