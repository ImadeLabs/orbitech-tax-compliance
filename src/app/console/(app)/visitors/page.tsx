import Link from "next/link";
import { connection } from "next/server";
import { getStore, type Visit } from "@/lib/store";
import { channelOf, summarize } from "@/lib/analytics";
import { formatDateTime, timeAgo } from "@/lib/format";
import { BarList, DailyBars, Kpi } from "@/components/console/bits";

export const metadata = { title: "Visitors" };

const RANGES = [1, 7, 30, 90] as const;

type Session = { id: string; visitorId: string; start: string; end: string; views: Visit[]; events: Visit[]; first: Visit; isNew: boolean };

export default async function VisitorsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await connection();
  const { days: d } = await searchParams;
  const days = RANGES.includes(Number(d) as (typeof RANGES)[number]) ? Number(d) : 7;
  const now = new Date();
  const since = new Date(now.getTime() - days * 86400_000);
  const store = getStore();
  const [visits, enquiries] = await Promise.all([store.listVisits({ since, limit: 50_000 }), store.listEnquiries({ limit: 2000 })]);
  const inRange = enquiries.filter((e) => new Date(e.createdAt) >= since);
  const s = summarize(visits, inRange, Math.max(days, 2), now);
  const enquiryByVisitor = new Map(enquiries.filter((e) => e.visitorId).map((e) => [e.visitorId, e]));

  const sessions = new Map<string, Session>();
  for (const v of [...visits].reverse()) {
    let x = sessions.get(v.sessionId);
    if (!x) {
      x = { id: v.sessionId, visitorId: v.visitorId, start: v.ts, end: v.ts, views: [], events: [], first: v, isNew: v.newVisitor };
      sessions.set(v.sessionId, x);
    }
    x.end = v.ts;
    (v.kind === "pageview" ? x.views : x.events).push(v);
  }
  const recent = [...sessions.values()].filter((x) => x.views.length).sort((a, b) => b.end.localeCompare(a.end)).slice(0, 60);
  const mins = (a: string, b: string) => Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Visitors</h1>
          <p className="text-sm text-slate-500">First-party analytics. No IP addresses are stored, and bots are filtered out.</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-sm" role="tablist" aria-label="Date range">
          {RANGES.map((r) => (
            <Link key={r} href={`/console/visitors?days=${r}`} role="tab" aria-selected={days === r} className={`rounded-md px-3 py-1.5 font-medium ${days === r ? "bg-navy-900 text-white" : "text-slate-600 hover:text-navy-900"}`}>
              {r === 1 ? "24h" : `${r}d`}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="On site now" value={String(s.live)} sub="last 5 minutes" tone={s.live ? "good" : undefined} />
        <Kpi label="Unique visitors" value={s.visitors.toLocaleString()} sub={`${s.newVisitors.toLocaleString()} new`} />
        <Kpi label="Sessions" value={s.sessions.toLocaleString()} sub={`${s.pagesPerSession.toFixed(1)} pages / session`} />
        <Kpi label="Page views" value={s.pageviews.toLocaleString()} />
        <Kpi label="Visitors who enquired" value={`${(s.conversion * 100).toFixed(1)}%`} sub={`${s.enquiries} enquiries`} />
      </div>

      <DailyBars data={s.series} valueKey="visitors" label="Unique visitors per day" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BarList title="Traffic sources" items={s.channels} />
        <BarList title="Top pages" items={s.topPages} />
        <BarList title="Locations" items={s.cities} empty="Location appears once the site runs on Vercel" />
        <BarList title="Devices" items={s.devices} />
      </div>

      <div className="card overflow-x-auto">
        <p className="px-5 pt-5 text-sm font-semibold text-navy-950">Recent sessions</p>
        <table className="mt-3 w-full text-sm">
          <thead className="border-y border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">When</th>
              <th className="px-4 py-2.5 font-semibold">Source</th>
              <th className="px-4 py-2.5 font-semibold">Pages viewed</th>
              <th className="hidden px-4 py-2.5 font-semibold lg:table-cell">Location · Device</th>
              <th className="px-4 py-2.5 font-semibold">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recent.map((x) => {
              const enq = enquiryByVisitor.get(x.visitorId);
              return (
                <tr key={x.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                    {timeAgo(x.end, now.getTime())}
                    <span className="block text-xs text-slate-400">
                      {formatDateTime(x.start)} · {mins(x.start, x.end)} min
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {channelOf(x.first)}
                    <span className="block text-xs text-slate-400">{x.isNew ? "New visitor" : "Returning"}</span>
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <span className="line-clamp-2 text-xs text-slate-600">{x.views.map((v) => v.path).join(" → ")}</span>
                    {x.events.length > 0 && <span className="mt-1 block text-xs text-gold-700">{[...new Set(x.events.map((e) => e.name))].join(", ")}</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
                    {[x.first.city, x.first.country].filter(Boolean).join(", ") || "—"}
                    <span className="block">
                      {x.first.device} · {x.first.browser}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {enq ? (
                      <Link href={`/console/enquiries/${enq.id}`} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 ring-inset">
                        Enquired: {enq.name}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">Browsing</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {!recent.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  No visits recorded in this period yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
