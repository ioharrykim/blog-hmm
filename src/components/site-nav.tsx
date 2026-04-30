import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Writing" },
  { href: "/archive", label: "Archive" },
  { href: "/about", label: "About" }
];

export function SiteNav() {
  return (
    <nav className="nav" aria-label="주요 메뉴">
      <Link className="nav__name" href="/">
        hmmhmm
      </Link>
      <div className="nav__links">
        {links.map((link) => {
          return (
            <Link key={link.href} className="nav__lnk" href={link.href}>
              {link.label}
            </Link>
          );
        })}
        <ThemeToggle />
      </div>
    </nav>
  );
}
