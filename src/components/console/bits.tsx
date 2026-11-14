import Link from "next/link";
import { STATUS_LABEL, type Enquiry, type Priority, type Status } from "@/lib/store/types";
import { formatDate, timeAgo } from "@/lib/format";
import { serviceTitle } from "@/lib/services";

const STATUS_TONE: Record<Status, string> = {
  new: "bg-gold-100 text-gold-700 ring-gold-200",
  contacted: "bg-sky-50 text-sky-700 ring-sky-200",
  qualified: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  proposal: "bg-violet-50 text-violet-700 ring-violet-200",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  lost: "bg-slate-100 text-slate-500 ring-slate-200",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}

const PRIORITY_TONE: Record<Priority, string> = {
  hot: "bg-red-50 text-red-700 ring-red-200",
  warm: "bg-amber-50 text-amber-700 ring-amber-200",
  cold: "bg-slate-100 text-slate-600 ring-slate-200",
};
const PRIORITY_ICON: Record<Priority, string> = { hot: "▲", warm: "●", cold: "▽" };

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${PRIORITY_TONE[priority]}`}>
      <span aria-hidden className="text-[9px]">{PRIORITY_ICON[priority]}</span>
      {priority}
    </span>
  );
}

export function FollowUpChip({ at, now }: { at: string | null; now: number }) {
  if (!at) return <span className="text-xs text-slate-400">No follow-up set</span>;
  const t = new Date(at).getTime();
  const overdue = t < now - 60_000;
  const today = !overdue && t - now < 86400_000;
  return (
    <span className={`text-xs font-medium ${overdue ? "text-red-600" : today ? "text-amber-700" : "text-slate-500"}`}>
      {overdue ? "Overdue · " : today ? "Due · " : "Next · "}
      {timeAgo(at, now)}
    </span>
  );
}

export function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "alert" | "good" }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold tracking-tight tabular-nums ${tone === "alert" ? "text-red-600" : tone === "good" ? "text-emerald-700" : "text-navy-950"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

/** Single-series daily bar chart with hover tooltips. */
export function DailyBars({ data, label, valueKey }: { data: { day: string; [k: string]: number | string }[]; label: string; valueKey: string }) {
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);
  const ticks = [max, Math.round(max / 2)];
  return (
    <figure className="card p-5">
      <figcaption className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-navy-950">{label}</span>
        <span className="text-xs text-slate-500">{total.toLocaleString()} total</span>
      </figcaption>
      <div className="relative mt-4 h-40">
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-dashed border-slate-200" style={{ bottom: `${(t / max) * 100}%` }}>
            <span className="absolute -top-2 right-0 bg-white pl-1 text-[10px] text-slate-400 tabular-nums">{t}</span>
          </div>
        ))}
        <div className="absolute inset-0 flex items-end gap-[2px] border-b border-slate-300 pr-6">
          {data.map((d, i) => {
            const v = values[i];
            return (
              <div key={d.day} className="group relative flex h-full flex-1 items-end" tabIndex={0} aria-label={`${formatDate(d.day, { day: "numeric", month: "short" })}: ${v}`}>
                <div className="w-full rounded-t-[4px] bg-navy-700 transition-colors group-hover:bg-gold-500 group-focus:bg-gold-500" style={{ height: `${(v / max) * 100}%`, minHeight: v ? 2 : 0 }} />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md bg-navy-950 px-2 py-1 text-xs whitespace-nowrap text-white shadow group-hover:block group-focus:block">
                  {formatDate(d.day, { day: "numeric", month: "short" })} · <strong>{v}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between pr-6 text-[10px] text-slate-400">
        <span>{formatDate(data[0]?.day ?? new Date(), { day: "numeric", month: "short" })}</span>
        <span>{formatDate(data.at(-1)?.day ?? new Date(), { day: "numeric", month: "short" })}</span>
      </div>
    </figure>
  );
}

export function BarList({ title, items, empty = "No data yet" }: { title: string; items: { label: string; count: number }[]; empty?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-navy-950">{title}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {items.map((i) => (
            <li key={i.label} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2.5 py-1.5 text-sm" title={`${i.label}: ${i.count}`}>
              <span className="absolute inset-y-0 left-0 rounded-md bg-navy-50" style={{ width: `${(i.count / max) * 100}%` }} aria-hidden />
              <span className="relative truncate text-slate-700">{i.label}</span>
              <span className="relative font-mono text-xs font-semibold text-navy-900 tabular-nums">{i.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EnquiryRow({ e, now }: { e: Enquiry; now: number }) {
  return (
    <tr className="group hover:bg-slate-50">
      <td className="px-4 py-3">
        <Link href={`/console/enquiries/${e.id}`} className="block">
          <span className="font-semibold text-navy-950 group-hover:text-navy-700">{e.name}</span>
          <span className="block text-xs text-slate-500">
            {e.company || "—"} · <span className="font-mono">{e.ref}</span>
          </span>
        </Link>
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <span className="line-clamp-2 text-xs text-slate-600">{e.services.length ? e.services.map(serviceTitle).join(", ") : e.message.slice(0, 80) || "—"}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={e.status} />
          <PriorityBadge priority={e.priority} />
        </div>
      </td>
      <td className="hidden px-4 py-3 text-xs text-slate-500 sm:table-cell">
        {timeAgo(e.createdAt, now)}
        <span className="block capitalize">{e.source}{e.score != null ? ` · ${e.score}/100` : ""}</span>
      </td>
      <td className="px-4 py-3">
        <FollowUpChip at={e.status === "won" || e.status === "lost" ? null : e.nextFollowUpAt} now={now} />
      </td>
    </tr>
  );
}

export function EnquiryTable({ rows, now }: { rows: Enquiry[]; now: number }) {
  if (!rows.length) return <div className="card p-10 text-center text-sm text-slate-500">No enquiries here yet.</div>;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Contact</th>
            <th className="hidden px-4 py-2.5 font-semibold md:table-cell">Interested in</th>
            <th className="px-4 py-2.5 font-semibold">Stage</th>
            <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Received</th>
            <th className="px-4 py-2.5 font-semibold">Follow-up</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((e) => (
            <EnquiryRow key={e.id} e={e} now={now} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
