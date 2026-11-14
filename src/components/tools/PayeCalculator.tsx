"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { computePit } from "@/lib/tax/pit";
import { naira, parseAmount, pct } from "@/lib/format";
import { MoneyField, Row, Toggle, useToolUsage } from "./fields";

type Period = "monthly" | "annual";

export function PayeCalculator() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [basic, setBasic] = useState("250,000");
  const [housing, setHousing] = useState("100,000");
  const [transport, setTransport] = useState("50,000");
  const [other, setOther] = useState("");
  const [rent, setRent] = useState("1,500,000");
  const [pension, setPension] = useState(true);
  const [nhf, setNhf] = useState(false);
  const [nhis, setNhis] = useState("");
  const [life, setLife] = useState("");

  const k = period === "monthly" ? 12 : 1;
  const r = computePit({
    basic: parseAmount(basic) * k,
    housing: parseAmount(housing) * k,
    transport: parseAmount(transport) * k,
    otherAllowances: parseAmount(other) * k,
    annualRent: parseAmount(rent),
    pension,
    nhf,
    nhis: parseAmount(nhis),
    lifeInsurance: parseAmount(life),
  });
  useToolUsage("paye", r.gross > 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
      <div className="card space-y-5 p-6">
        <div className="flex rounded-lg bg-slate-100 p-1 text-sm font-medium" role="tablist" aria-label="Pay period">
          {(["monthly", "annual"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={`flex-1 rounded-md py-2 capitalize transition ${period === p ? "bg-white text-navy-900 shadow-sm" : "text-slate-500"}`}
            >
              {p} pay
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField id="basic" label={`Basic salary (${period})`} value={basic} onChange={setBasic} />
          <MoneyField id="housing" label={`Housing (${period})`} value={housing} onChange={setHousing} />
          <MoneyField id="transport" label={`Transport (${period})`} value={transport} onChange={setTransport} />
          <MoneyField id="other" label={`Other allowances (${period})`} value={other} onChange={setOther} hint="Utility, meal, leave allowance, etc." />
        </div>
        <MoneyField id="rent" label="Annual rent you pay" value={rent} onChange={setRent} hint="Used for rent relief: 20% of rent, up to ₦500,000" />
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <Toggle id="pension" label="Contributory pension (8%)" hint="On basic + housing + transport" checked={pension} onChange={setPension} />
          <Toggle id="nhf" label="National Housing Fund (2.5% of basic)" checked={nhf} onChange={setNhf} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField id="nhis" label="NHIS contribution (annual)" value={nhis} onChange={setNhis} />
          <MoneyField id="life" label="Life assurance premium (annual)" value={life} onChange={setLife} />
        </div>
        <p className="text-xs text-slate-500">Tip: you can type amounts like 250k or 1.5m.</p>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl bg-navy-950 p-6 text-white">
          <p className="text-sm text-white/60">Monthly PAYE</p>
          <p className="mt-1 font-mono text-4xl font-bold tracking-tight tabular-nums">{naira(r.monthlyTax)}</p>
          <div className="mt-5 grid grid-cols-3 gap-4 border-t border-white/10 pt-5 text-sm">
            <div>
              <p className="text-white/55">Annual PAYE</p>
              <p className="mt-0.5 font-mono font-semibold tabular-nums">{naira(r.annualTax)}</p>
            </div>
            <div>
              <p className="text-white/55">Effective rate</p>
              <p className="mt-0.5 font-mono font-semibold tabular-nums">{pct(r.effectiveRate)}</p>
            </div>
            <div>
              <p className="text-white/55">Net pay / month</p>
              <p className="mt-0.5 font-mono font-semibold text-gold-300 tabular-nums">{naira(r.netMonthly)}</p>
            </div>
          </div>
          {r.exemptMinimumWage && <p className="mt-4 rounded-lg bg-emerald-500/15 p-3 text-sm text-emerald-200">Earnings are at or below the national minimum wage, so they are exempt from PAYE.</p>}
        </div>

        <div className="card divide-y divide-slate-100 px-5 py-2">
          <Row label="Gross annual income" value={naira(r.gross)} strong />
          <Row label="Less: pension (8%)" value={`– ${naira(r.pension)}`} muted />
          {r.nhf > 0 && <Row label="Less: NHF (2.5%)" value={`– ${naira(r.nhf)}`} muted />}
          {r.otherDeductions > 0 && <Row label="Less: NHIS / life assurance" value={`– ${naira(r.otherDeductions)}`} muted />}
          <Row label="Less: rent relief" value={`– ${naira(r.rentRelief)}`} muted />
          <Row label="Chargeable income" value={naira(r.chargeable)} strong />
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Band</th>
                <th className="px-4 py-2.5 text-right font-semibold">Rate</th>
                <th className="px-4 py-2.5 text-right font-semibold">Taxable</th>
                <th className="px-4 py-2.5 text-right font-semibold">Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {r.bands.map((b, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5 font-sans text-slate-600">{b.to === Infinity ? `Above ${naira(b.from)}` : `Up to ${naira(b.to)}`}</td>
                  <td className="px-4 py-2.5 text-right">{pct(b.rate, 0)}</td>
                  <td className="px-4 py-2.5 text-right">{naira(b.taxable)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-navy-900">{naira(b.tax)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
          <p className="font-semibold text-navy-950">Running payroll for a team?</p>
          <p className="mt-1 text-sm text-slate-700">We rebuild payroll on the 2026 bands, remit to FCT-IRS and file your annual returns due 31 January 2027.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tools/payroll" className="text-sm font-semibold text-navy-700 hover:underline">
              Full payroll cost (pension, NSITF, ITF) →
            </Link>
            <Link href="/services/paye-payroll#enquire" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">
              Get payroll help <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
