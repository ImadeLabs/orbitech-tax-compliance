"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { buildDeadlines, OBLIGATIONS, type Deadline, type Obligation } from "@/lib/tax/calendar";
import { track } from "@/components/site/Tracker";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ALL = Object.keys(OBLIGATIONS) as Obligation[];
const DEFAULT: Obligation[] = ["paye", "vat", "wht", "pension", "nsitf", "itf", "cit", "paye-annual", "tcc"];

function ics(list: Deadline[]) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Orbitech Tax & Compliance//Deadlines//EN", "CALSCALE:GREGORIAN"];
  list.forEach((d, i) => {
    const day = d.date.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${day}-${d.obligation}-${i}@orbitech`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `SUMMARY:${d.label} (${d.agency})`,
      `DESCRIPTION:Period: ${d.period}. Reminder from Orbitech Tax & Compliance.`,
      "BEGIN:VALARM",
      "TRIGGER:-P3D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${d.label} due in 3 days`,
      "END:VALARM",
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

const noop = () => () => {};

export function DeadlineCalendar() {
  const [selected, setSelected] = useState<Obligation[]>(DEFAULT);
  const [fye, setFye] = useState(11);
  const [months, setMonths] = useState(12);
  const todayIso = useSyncExternalStore(noop, () => new Date(Date.now() + 3600_000).toISOString().slice(0, 10), () => "");

  if (!todayIso) return <div className="card h-96 animate-pulse bg-slate-50" />;

  const list = buildDeadlines({ from: new Date(`${todayIso}T00:00:00Z`), months, obligations: selected, fyeMonth: fye });
  const byMonth = new Map<string, Deadline[]>();
  for (const d of list) {
    const k = d.date.slice(0, 7);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k)!.push(d);
  }

  const download = () => {
    const blob = new Blob([ics(list)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "orbitech-compliance-deadlines.ics";
    a.click();
    URL.revokeObjectURL(a.href);
    track("calendar:download");
  };

  const toggle = (o: Obligation) => setSelected((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  const daysTo = (d: string) => Math.round((Date.parse(d) - Date.parse(todayIso)) / 86400_000);

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="card h-fit space-y-6 p-5 lg:sticky lg:top-24">
        <div>
          <p className="label">Obligations that apply to you</p>
          <div className="space-y-2">
            {ALL.map((o) => (
              <label key={o} className="flex cursor-pointer items-start gap-2.5 text-sm">
                <input type="checkbox" className="mt-0.5 size-4 accent-navy-800" checked={selected.includes(o)} onChange={() => toggle(o)} />
                <span>
                  <span className="text-slate-800">{OBLIGATIONS[o].label}</span>
                  <span className="block text-xs text-slate-500">{OBLIGATIONS[o].rule}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="fye">Year end</label>
            <select id="fye" className="input" value={fye} onChange={(e) => setFye(Number(e.target.value))}>
              {MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="months">Show</label>
            <select id="months" className="input" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
              {[3, 6, 12, 18].map((m) => <option key={m} value={m}>{m} months</option>)}
            </select>
          </div>
        </div>
        <button type="button" className="btn-navy w-full" onClick={download} disabled={!list.length}>
          <Download size={16} /> Add to my calendar (.ics)
        </button>
        <p className="text-xs text-slate-500">If a deadline falls on a weekend or public holiday, file before it. Confirm your pension date against your actual payday.</p>
      </aside>

      <div className="space-y-8">
        {[...byMonth.entries()].map(([k, items]) => {
          const [y, m] = k.split("-").map(Number);
          return (
            <section key={k}>
              <h2 className="mb-3 text-sm font-bold tracking-wide text-slate-500 uppercase">
                {MONTH_NAMES[m - 1]} {y}
              </h2>
              <ul className="card divide-y divide-slate-100">
                {items.map((d, i) => {
                  const days = daysTo(d.date);
                  return (
                    <li key={i} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-12 shrink-0 text-center">
                        <p className="text-xl leading-none font-bold text-navy-950">{Number(d.date.slice(8))}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">{MONTH_NAMES[m - 1].slice(0, 3)}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/services/${d.service}`} className="font-medium text-slate-900 hover:text-navy-700">
                          {d.label}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {d.agency} · {d.period}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${days <= 7 ? "bg-red-50 text-red-700" : days <= 30 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {days === 0 ? "Today" : `${days}d`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {!list.length && <p className="text-slate-500">Select at least one obligation.</p>}
      </div>
    </div>
  );
}
