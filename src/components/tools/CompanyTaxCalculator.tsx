"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { computeCompanyTax } from "@/lib/tax/company";
import { naira, parseAmount, pct } from "@/lib/format";
import { MoneyField, Row, Toggle, useToolUsage } from "./fields";

export function CompanyTaxCalculator() {
  const [turnover, setTurnover] = useState("320m");
  const [assets, setAssets] = useState("90m");
  const [profit, setProfit] = useState("48m");
  const [prof, setProf] = useState(false);
  const [mne, setMne] = useState(false);

  const r = computeCompanyTax({
    turnover: parseAmount(turnover),
    fixedAssets: parseAmount(assets),
    profit: parseAmount(profit),
    professionalServices: prof,
    partOfMultinational: mne,
  });
  useToolUsage("company-tax", parseAmount(turnover) > 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
      <div className="card space-y-5 p-6">
        <MoneyField id="turnover" label="Annual turnover (gross)" value={turnover} onChange={setTurnover} />
        <MoneyField id="assets" label="Total fixed assets" value={assets} onChange={setAssets} />
        <MoneyField id="profit" label="Assessable profit (after allowable expenses & capital allowances)" value={profit} onChange={setProfit} />
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <Toggle id="prof" label="We provide professional services" hint="e.g. legal, accounting, consulting, engineering. Excluded from small-company status." checked={prof} onChange={setProf} />
          <Toggle id="mne" label="Part of a multinational group" checked={mne} onChange={setMne} />
        </div>
      </div>

      <div className="space-y-5">
        <div className={`flex gap-4 rounded-2xl p-5 ${r.isSmall ? "bg-emerald-50 text-emerald-900" : "bg-navy-50 text-navy-900"}`}>
          {r.isSmall ? <BadgeCheck className="shrink-0" /> : <CircleAlert className="shrink-0" />}
          <div>
            <p className="font-semibold">{r.isSmall ? "Likely a small company: 0% CIT" : "Not a small company: CIT and development levy apply"}</p>
            <p className="mt-1 text-sm opacity-80">{r.smallReason}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-navy-950 p-6 text-white">
          <p className="text-sm text-white/60">Estimated tax for the year</p>
          <p className="mt-1 font-mono text-4xl font-bold tracking-tight tabular-nums">{naira(r.total)}</p>
          <p className="mt-1 text-sm text-white/60">{pct(r.effectiveRateOnProfit)} of assessable profit</p>
        </div>

        <div className="card divide-y divide-slate-100 px-5 py-2">
          <Row label={`Company income tax (${pct(r.citRate, 0)})`} value={naira(r.cit)} />
          <Row label="Development levy (4%)" value={naira(r.developmentLevy)} />
          <Row label="Total" value={naira(r.total)} strong />
        </div>

        <ul className="space-y-2.5 text-sm text-slate-700">
          {r.notes.map((n) => (
            <li key={n} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-500" /> {n}
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
          <p className="font-semibold text-navy-950">File your FY2026 return with confidence</p>
          <p className="mt-1 text-sm text-slate-700">We prepare your CIT and development levy computation, claim your capital allowances and WHT credits, and file with NRS.</p>
          <Link href="/services/company-income-tax#enquire" className="mt-3 inline-block text-sm font-semibold text-navy-700 hover:underline">
            Get a quote →
          </Link>
        </div>
      </div>
    </div>
  );
}
