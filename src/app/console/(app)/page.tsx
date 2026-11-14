import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { connection } from "next/server";
import { getStore } from "@/lib/store";
import { summarize } from "@/lib/analytics";
import { naira, pct } from "@/lib/format";
import { serviceTitle } from "@/lib/services";
import { BarList, DailyBars, EnquiryTable, Kpi } from "@/components/console/bits";

export const metadata = { title: "Dashboard" };

const RANGES = [7, 30, 90] as const;

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await connection();
  const { days: d } = await searchParams;
  const days = RANGES.includes(Number(d) as (typeof RANGES)[number]) ? Number(d) : 30;
  const now = new Date();
  const since = new Date(now.getTime() - days * 86400_000);
  const store = getStore();

  const [visits, all] = await Promise.all([store.listVisits({ since, limit: 50_000 }), store.listEnquiries({ limit: 2000 })]);
  const inRange = all.filter((e) => new Date(e.createdAt) >= since);
  const s = summarize(visits, inRange, days, now);

  const open = all.filter((e) => e.status !== "won" && e.status !== "lost");
  const overdue = open.filter((e) => e.nextFollowUpAt && new Date(e.nextFollowUpAt).getTime() <= now.getTime());
  const pipelineValue = open.reduce((a, e) => a + (e.estimatedValue ?? 0), 0);
  const won = inRange.filter((e) => e.status === "won");

  const serviceDemand = new Map<string, number>();
  for (const e of inRange) for (const sv of e.services) serviceDemand.set(sv, (serviceDemand.get(sv) ?? 0) + 1);
  const demand = [...serviceDemand.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ label: serviceTitle(k), count: v }));

  const stages = (["new", "contacted", "qualified", "proposal"] as const).map((st) => ({ st, n: open.filter((e) => e.status === st).length }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Dashboard</h1>
          <p className="text-sm text-slate-500">
            {s.live > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="size-2 animate-pulse rounded-full bg-emerald-500" /> {s.live} on the site now
              </span>
            ) : (
              "No one on the site right now"
            )}
          </p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-sm" role="tablist" aria-label="Date range">
          {RANGES.map((r) => (
            <Link key={r} href={`/console?days=${r}`} role="tab" aria-selected={days === r} className={`rounded-md px-3 py-1.5 font-medium ${days === r ? "bg-navy-900 text-white" : "text-slate-600 hover:text-navy-900"}`}>
              {r} days
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Unique visitors" value={s.visitors.toLocaleString()} sub={`${s.newVisitors.toLocaleString()} new · ${s.pageviews.toLocaleString()} page views`} />
        <Kpi label="Enquiries" value={s.enquiries.toLocaleString()} sub={`${pct(s.conversion)} of visitors enquired`} />
        <Kpi label="Follow-ups due" value={String(overdue.length)} sub={`${open.length} open enquiries`} tone={overdue.length ? "alert" : undefined} />
        <Kpi label="Pipeline value" value={naira(pipelineValue)} sub={`${won.length} won in this period`} tone={won.length ? "good" : undefined} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyBars data={s.series} valueKey="visitors" label="Unique visitors per day" />
        <DailyBars data={s.series} valueKey="enquiries" label="Enquiries per day" />
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-navy-950">Open pipeline</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stages.map(({ st, n }) => (
            <Link key={st} href={`/console/enquiries?status=${st}`} className="rounded-xl border border-slate-200 p-4 transition hover:border-navy-300">
              <p className="text-xs font-semibold text-slate-500 capitalize">{st === "proposal" ? "Proposal sent" : st}</p>
              <p className="mt-1 text-2xl font-bold text-navy-950 tabular-nums">{n}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BarList title="Traffic sources" items={s.channels} />
        <BarList title="Top pages" items={s.topPages} />
        <BarList title="Services requested" items={demand} empty="No enquiries in this period" />
        <BarList title="Tool usage & clicks" items={s.events.map((e) => ({ label: e.label.replace(/^tool:/, "Calculator: ").replace(/^click:/, "Clicked: ").replace("readiness:scored", "Readiness check completed").replace("calendar:download", "Calendar downloaded"), count: e.count }))} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-navy-950">Needs attention</h2>
          <Link href="/console/follow-ups" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">
            All follow-ups <ArrowRight size={14} />
          </Link>
        </div>
        <EnquiryTable rows={overdue.sort((a, b) => (a.priority === "hot" ? -1 : 0) - (b.priority === "hot" ? -1 : 0)).slice(0, 8)} now={now.getTime()} />
      </div>
    </div>
  );
}
