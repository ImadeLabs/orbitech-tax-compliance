"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Payload = { kind: "pageview" | "event"; name?: string; path: string };

function readAttribution() {
  const m = document.cookie.match(/(?:^|; )orb_attr=([^;]*)/);
  return m ? m[1] : null;
}

function send(p: Payload) {
  const params = new URLSearchParams(location.search);
  const body = JSON.stringify({
    ...p,
    referrer: document.referrer,
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
  });
  try {
    if (navigator.sendBeacon?.(`/api/track`, new Blob([body], { type: "application/json" }))) return;
  } catch {}
  fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
}

/** Fire a custom analytics event (tool used, WhatsApp clicked, …). */
export function track(name: string) {
  if (typeof window === "undefined") return;
  send({ kind: "event", name, path: location.pathname });
}

export function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    // First-touch attribution, carried onto any enquiry submitted later.
    if (!readAttribution()) {
      const params = new URLSearchParams(location.search);
      let ref = document.referrer;
      try {
        if (ref && new URL(ref).host === location.host) ref = "";
      } catch {
        ref = "";
      }
      const attr = {
        landing: location.pathname,
        ref: ref.slice(0, 300),
        us: params.get("utm_source") ?? "",
        um: params.get("utm_medium") ?? "",
        uc: params.get("utm_campaign") ?? "",
      };
      document.cookie = `orb_attr=${encodeURIComponent(JSON.stringify(attr))}; path=/; max-age=${60 * 60 * 24 * 90}; samesite=lax`;
    }
  }, []);

  useEffect(() => {
    send({ kind: "pageview", path: pathname });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.includes("wa.me")) track("click:whatsapp");
      else if (href.startsWith("tel:")) track("click:call");
      else if (href.startsWith("mailto:")) track("click:email");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
