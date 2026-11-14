import type { Enquiry, Visit } from "./store/types";

export function channelOf(v: Pick<Visit, "referrer" | "utmSource" | "utmMedium">): string {
  const src = v.utmSource.toLowerCase();
  if (src) {
    if (/whatsapp|wa/.test(src)) return "WhatsApp";
    if (/google|gads|adwords/.test(src)) return v.utmMedium.toLowerCase().includes("cpc") ? "Google Ads" : "Google";
    if (/facebook|fb|meta|instagram|ig/.test(src)) return "Facebook / Instagram";
    if (/linkedin/.test(src)) return "LinkedIn";
    if (/twitter|x\.com|^x$/.test(src)) return "X (Twitter)";
    if (/email|newsletter|mail/.test(src)) return "Email";
    return v.utmSource;
  }
  const r = v.referrer.toLowerCase();
  if (!r) return "Direct";
  if (r.includes("google.")) return "Google";
  if (r.includes("bing.") || r.includes("duckduckgo") || r.includes("yahoo.")) return "Other search";
  if (r.includes("whatsapp") || r.includes("wa.me")) return "WhatsApp";
  if (r.includes("facebook") || r.includes("instagram") || r.includes("fb.")) return "Facebook / Instagram";
  if (r.includes("linkedin") || r.includes("lnkd.in")) return "LinkedIn";
  if (r.includes("t.co") || r.includes("twitter") || r.includes("x.com")) return "X (Twitter)";
  try {
    return new URL(r).hostname.replace(/^www\./, "");
  } catch {
    return "Referral";
  }
}

const lagosDay = (iso: string) => new Date(new Date(iso).getTime() + 3600_000).toISOString().slice(0, 10);

function top(map: Map<string, number>, n = 8) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, count]) => ({ label, count }));
}
const bump = (m: Map<string, number>, k: string, by = 1) => m.set(k, (m.get(k) ?? 0) + by);

export function summarize(visits: Visit[], enquiries: Enquiry[], days: number, now = new Date()) {
  const pageviews = visits.filter((v) => v.kind === "pageview");
  const events = visits.filter((v) => v.kind === "event");
  const visitors = new Set(pageviews.map((v) => v.visitorId));
  const sessions = new Set(pageviews.map((v) => v.sessionId));
  const newVisitors = new Set(pageviews.filter((v) => v.newVisitor).map((v) => v.visitorId));
  const live = new Set(visits.filter((v) => now.getTime() - new Date(v.ts).getTime() < 5 * 60_000).map((v) => v.visitorId));

  const pages = new Map<string, number>();
  const channels = new Map<string, number>();
  const cities = new Map<string, number>();
  const devices = new Map<string, number>();
  const eventCounts = new Map<string, number>();
  const sessionChannel = new Map<string, string>();

  for (const v of [...pageviews].reverse()) {
    bump(pages, v.path);
    if (!sessionChannel.has(v.sessionId)) sessionChannel.set(v.sessionId, channelOf(v));
  }
  for (const c of sessionChannel.values()) bump(channels, c);
  const seenVisitor = new Set<string>();
  for (const v of pageviews) {
    if (seenVisitor.has(v.visitorId)) continue;
    seenVisitor.add(v.visitorId);
    bump(cities, v.city ? `${v.city}${v.country && v.country !== "NG" ? `, ${v.country}` : ""}` : v.country || "Unknown");
    bump(devices, v.device || "Unknown");
  }
  for (const e of events) bump(eventCounts, e.name);

  const series: { day: string; visitors: number; pageviews: number; enquiries: number }[] = [];
  const dayVisitors = new Map<string, Set<string>>();
  const dayViews = new Map<string, number>();
  const dayEnq = new Map<string, number>();
  for (const v of pageviews) {
    const d = lagosDay(v.ts);
    if (!dayVisitors.has(d)) dayVisitors.set(d, new Set());
    dayVisitors.get(d)!.add(v.visitorId);
    bump(dayViews, d);
  }
  for (const e of enquiries) bump(dayEnq, lagosDay(e.createdAt));
  for (let i = days - 1; i >= 0; i--) {
    const d = lagosDay(new Date(now.getTime() - i * 86400_000).toISOString());
    series.push({ day: d, visitors: dayVisitors.get(d)?.size ?? 0, pageviews: dayViews.get(d) ?? 0, enquiries: dayEnq.get(d) ?? 0 });
  }

  return {
    visitors: visitors.size,
    newVisitors: newVisitors.size,
    sessions: sessions.size,
    pageviews: pageviews.length,
    live: live.size,
    enquiries: enquiries.length,
    // Share of visitors who went on to enquire (a visitor sending two enquiries counts once).
    conversion: visitors.size
      ? Math.min(1, (new Set(enquiries.map((e) => e.visitorId).filter((id) => id && visitors.has(id))).size || 0) / visitors.size)
      : 0,
    pagesPerSession: sessions.size ? pageviews.length / sessions.size : 0,
    topPages: top(pages),
    channels: top(channels),
    cities: top(cities),
    devices: top(devices, 4),
    events: top(eventCounts, 10),
    series,
  };
}

export function parseUserAgent(ua: string) {
  const s = ua.toLowerCase();
  const device = /ipad|tablet/.test(s) ? "Tablet" : /mobi|android|iphone/.test(s) ? "Mobile" : "Desktop";
  const browser = /edg\//.test(s)
    ? "Edge"
    : /opr\/|opera/.test(s)
      ? "Opera"
      : /chrome|crios/.test(s)
        ? "Chrome"
        : /firefox|fxios/.test(s)
          ? "Firefox"
          : /safari/.test(s)
            ? "Safari"
            : "Other";
  return { device, browser };
}

export const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp\/|preview|headless|lighthouse|pingdom|uptime|curl|wget|python|axios|node-fetch|vercel-screenshot/i;
