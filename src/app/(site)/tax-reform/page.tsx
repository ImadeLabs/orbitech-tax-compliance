import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, PageHeader } from "@/components/site/ui";
import { naira, pct } from "@/lib/format";
import {
  CIT_RATE,
  DEVELOPMENT_LEVY_RATE,
  MIN_ETR_RATE,
  MIN_ETR_TURNOVER,
  PIT_BANDS,
  RENT_RELIEF_CAP,
  SMALL_COMPANY_FIXED_ASSETS,
  SMALL_COMPANY_TURNOVER,
  VAT_RATE,
} from "@/lib/tax/rules";

export const metadata: Metadata = {
  title: "Nigeria's 2026 Tax Reform & Tax Year 2027 Explained",
  description: "What the Nigeria Tax Act 2025 and Tax Administration Act 2025 change for businesses and employers, and what to do before your 2027 returns.",
};

const bandLabel = (i: number) => {
  const from = i === 0 ? 0 : PIT_BANDS[i - 1].upTo;
  const to = PIT_BANDS[i].upTo;
  if (i === 0) return `First ${naira(to)}`;
  if (to === Infinity) return `Above ${naira(from)}`;
  return `${naira(from + 1)} – ${naira(to)}`;
};

const TODO = [
  { when: "Now", what: "Re-run payroll on the new PAYE bands and collect rent evidence from staff for rent relief." },
  { when: "Now", what: "Check whether you qualify as a small company. If you are close to the line, plan for it." },
  { when: "Now", what: "Move to digital books that are ready for e-invoicing and fiscalisation." },
  { when: "Dec 2026", what: "Close FY2026 books. Reconcile WHT credit notes and input VAT." },
  { when: "Jan 2027", what: "File annual PAYE returns by 31 January and apply for your 2027 TCC." },
  { when: "Apr 2027", what: "Pay ITF 1% on 2026 payroll by 1 April and renew your ITF certificate." },
  { when: "Jun 2027", what: "File FY2026 CIT and development levy returns by 30 June (for a December year end)." },
];

export default function TaxReformPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nigeria Tax Act 2025 · Nigeria Tax Administration Act 2025"
        title="The 2026 tax reform, and why 2027 is the year that matters"
        intro="The new laws took effect on 1 January 2026. Everything you earn, pay and deduct this year is taxed under them, and you file the returns in 2027. Here is what changed and what to do about it."
      />

      <div className="container-x grid gap-14 py-16 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-14">
          <section>
            <h2 className="text-2xl font-bold text-navy-950">1. Personal income tax & PAYE</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              The Consolidated Relief Allowance (CRA) is abolished. Employees now get a tax-free first band, plus rent relief of 20% of annual rent, capped at {naira(RENT_RELIEF_CAP)}.
              Pension, NHF, NHIS, life assurance premiums and mortgage interest remain deductible. People earning the national minimum wage or less are exempt.
            </p>
            <div className="card mt-6 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Annual chargeable income</th>
                    <th className="px-4 py-3 text-right font-semibold">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PIT_BANDS.map((b, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-slate-700">{bandLabel(i)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-navy-900">{pct(b.rate, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href="/tools/paye" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">
              Calculate PAYE on the new bands <ArrowRight size={14} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy-950">2. Companies</h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              <li>
                <strong className="text-navy-900">Small companies pay 0% CIT</strong> if turnover is {naira(SMALL_COMPANY_TURNOVER)} or less and fixed assets are{" "}
                {naira(SMALL_COMPANY_FIXED_ASSETS)} or less. Professional-services firms are excluded. They must still file.
              </li>
              <li>
                <strong className="text-navy-900">Other companies pay {pct(CIT_RATE, 0)} CIT</strong> plus a{" "}
                <strong className="text-navy-900">{pct(DEVELOPMENT_LEVY_RATE, 0)} development levy</strong> on assessable profits. The levy replaces the Tertiary Education Tax, the IT levy, NASENI and the Police Trust Fund levies.
              </li>
              <li>
                <strong className="text-navy-900">{pct(MIN_ETR_RATE, 0)} minimum effective tax rate</strong> for members of multinational groups and companies with turnover of{" "}
                {naira(MIN_ETR_TURNOVER)} or more.
              </li>
              <li>
                <strong className="text-navy-900">Capital gains</strong> are taxed at the CIT rate for companies (0% for small companies).
              </li>
            </ul>
            <Link href="/tools/company-tax" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">
              Estimate your CIT & development levy <ArrowRight size={14} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy-950">3. VAT</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              The rate stays at {pct(VAT_RATE, 1)}. Input VAT on fixed assets and services can now be recovered, exports are zero-rated and essential items
              (basic food, education, health) are relieved. Monthly returns, including nil returns, are due by the 21st.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy-950">4. Administration: NRS, penalties & e-invoicing</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              The Nigeria Revenue Service (NRS) replaces FIRS. The Tax Administration Act harmonises filing rules across federal and state authorities, introduces
              higher penalties for late filing and non-registration, and supports e-invoicing and fiscalisation. Payroll levies are unchanged: PenCom (18%), NSITF (1%), ITF (1%) and NHF (2.5%).
              They still apply and are still checked for every federal contract.
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-navy-950">Your Tax Year 2027 checklist</h2>
            <ol className="mt-5 space-y-4">
              {TODO.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 w-16 shrink-0 text-xs font-semibold text-gold-700">{t.when}</span>
                  <span className="text-sm text-slate-700">{t.what}</span>
                </li>
              ))}
            </ol>
            <Link href="/readiness" className="btn-gold mt-6 w-full">
              Score my readiness <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
      <CtaBand />
    </>
  );
}
