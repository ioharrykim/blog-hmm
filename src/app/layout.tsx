import type { Metadata, Viewport } from "next";
import { AdSenseScript } from "@/components/adsense";
import { AdminCommand } from "@/components/admin-command";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { pageMetadata } from "@/lib/metadata";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  ...pageMetadata(),
  metadataBase: new URL(siteUrl()),
  applicationName: site.name,
  authors: [{ name: site.author }],
  creator: site.author,
  publisher: site.author,
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0e" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('hm.theme');if(t){document.documentElement.dataset.theme=t}}catch(e){}"
          }}
        />
        <AdSenseScript />
        <AdminCommand />
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
