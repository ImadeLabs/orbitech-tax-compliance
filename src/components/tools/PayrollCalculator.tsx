"use client";

import { useState } from "react";
import Link from "next/link";
import { computePayroll } from "@/lib/tax/payroll";
import { naira, parseAmount } from "@/lib/format";
import { MoneyField, Row, Toggle, useToolUsage } from "./fields";

export function PayrollCalculator() {
  const [employees, setEmployees] = useState("12");
  const [basic, setBasic] = useState("180,000");
  const [housing, setHousing] = useState("70,000");
  const [transport, setTransport] = useState("40,000");
  const [other, setOther] = useState("20,000");
  const [rent, setRent] = useState("1,200,000");
  const [turnover, setTurnover] = useState("150m");
  const [nhf, setNhf] = useState(false);

  const r = computePayroll({
    employees: Number(employees) || 1,
    basic: parseAmount(basic),
    housing: parseAmount(housing),
    transport: parseAmount(transport),
    otherAllowances: parseAmount(other),
    annualRent: parseAmount(rent),
    annualTurnover: parseAmount(turnover),
    nhf,
  });
  useToolUsage("payroll", r.perEmployee.grossMonthly > 0);
  const p = r.perEmployee;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="card space-y-5 p-6">
        <div>
          <label htmlFor="employees" className="label">
            Number of employees
          </label>
          <input id="employees" type="number" min={1} inputMode="numeric" className="input" value={employees} onChange={(e) => setEmployees(e.target.value)} />
        </div>
        <p className="text-sm font-medium text-slate-700">Average monthly pay per employee</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField id="basic" label="Basic" value={basic} onChange={setBasic} />
          <MoneyField id="housing" label="Housing" value={housing} onChange={setHousing} />
          <MoneyField id="transport" label="Transport" value={transport} onChange={setTransport} />
          <MoneyField id="other" label="Other allowances" value={other} onChange={setOther} />
        </div>
        <MoneyField id="rent" label="Average annual rent per employee" value={rent} onChange={setRent} hint="For PAYE rent relief" />
        <MoneyField id="turnover" label="Company annual turnover" value={turnover} onChange={setTurnover} hint="ITF applies at ₦50m+ turnover or 5+ staff" />
        <Toggle id="nhf" label="Deduct NHF (2.5% of basic)" checked={nhf} onChange={setNhf} />
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl bg-navy-950 p-6 text-white">
          <p className="text-sm text-white/60">True monthly cost of your payroll</p>
          <p className="mt-1 font-mono text-4xl font-bold tracking-tight tabular-nums">{naira(r.monthly.employerCost)}</p>
          <p className="mt-1 text-sm text-white/60">
            {naira(r.annual.employerCost)} a year for {r.employees} staff · {naira(p.employerCostMonthly)} per employee each month
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-1 ${r.pensionApplies ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/60"}`}>
              Pension {r.pensionApplies ? "applies" : "not required (<3 staff)"}
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-emerald-200">NSITF applies</span>
            <span className={`rounded-full px-2.5 py-1 ${r.itfApplies ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/60"}`}>
              ITF {r.itfApplies ? "applies" : "not required"}
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="card px-5 py-3">
            <p className="py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Per employee / month</p>
            <div className="divide-y divide-slate-100">
              <Row label="Gross pay" value={naira(p.grossMonthly)} strong />
              <Row label="PAYE" value={`– ${naira(p.paye)}`} muted />
              <Row label="Pension (8%)" value={`– ${naira(p.employeePension)}`} muted />
              {nhf && <Row label="NHF (2.5%)" value={`– ${naira(p.nhf)}`} muted />}
              <Row label="Net pay" value={naira(p.netMonthly)} strong />
            </div>
          </div>
          <div className="card px-5 py-3">
            <p className="py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Employer on-costs / employee</p>
            <div className="divide-y divide-slate-100">
              <Row label="Pension (10%)" value={naira(p.employerPension)} />
              <Row label="NSITF (1%)" value={naira(p.nsitf)} />
              <Row label="ITF (1%, accrued)" value={naira(p.itf)} />
              <Row label="Total cost" value={naira(p.employerCostMonthly)} strong />
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Remittance (whole team)</th>
                <th className="px-4 py-2.5 font-semibold">Due</th>
                <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["PAYE → FCT-IRS", "10th monthly", r.monthly.paye],
                ["Pension (18%) → PFAs", "7 working days after payday", r.monthly.employeePension + r.monthly.employerPension],
                ...(nhf ? [["NHF → FMBN", "Monthly", r.monthly.nhf] as const] : []),
                ["NSITF (1%)", "Monthly", r.monthly.nsitf],
                ["ITF (1% of annual payroll)", "1 April, yearly", r.annual.itf],
              ].map(([l, d, v]) => (
                <tr key={String(l)}>
                  <td className="px-4 py-2.5 text-slate-700">{l}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{d}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-navy-900 tabular-nums">{naira(Number(v))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
          <p className="font-semibold text-navy-950">Need ITF, NSITF or PenCom certificates?</p>
          <p className="mt-1 text-sm text-slate-700">We register you, reconcile any arrears and obtain the certificates required for BPP registration and federal tenders.</p>
          <Link href="/government-contracts#enquire" className="mt-3 inline-block text-sm font-semibold text-navy-700 hover:underline">
            Get my certificates sorted →
          </Link>
        </div>
      </div>
    </div>
  );
}
