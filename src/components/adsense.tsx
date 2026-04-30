"use client";

import Script from "next/script";
import { useEffect } from "react";

const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export function AdSenseScript() {
  if (!enabled || !client) return null;
  return (
    <Script
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
}

export function AdSlot({ slot, className = "" }: { slot?: string; className?: string }) {
  useEffect(() => {
    if (!enabled || !client || !slot) return;
    try {
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || [];
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.push({});
    } catch {}
  }, [slot]);

  if (!enabled || !client || !slot) return null;

  return (
    <aside className={`ad-slot ${className}`} aria-label="Advertisement">
      <span>Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
