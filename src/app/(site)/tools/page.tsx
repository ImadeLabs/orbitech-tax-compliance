import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Calculator, CalendarDays, Receipt, Users } from "lucide-react";
import { PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Free Nigerian Tax Calculators (2026 Rules)",
  description: "PAYE on the 2026 bands, payroll cost with pension, NSITF and ITF, CIT and development levy, VAT, plus a Tax Year 2027 readiness score.",
};

const TOOLS = [
  { href: "/readiness", icon: BadgeCheck, title: "Tax Year 2027 readiness score", text: "12 questions across tax, payroll levies, contracts and records. You get a score and an action plan right away." },
  { href: "/tools/paye", icon: Calculator, title: "PAYE calculator", text: "Employee tax on the Nigeria Tax Act 2025 bands, with rent relief, pension and NHF, plus net pay." },
  { href: "/tools/payroll", icon: Users, title: "Payroll cost & statutory levies", text: "What each employee really costs once you add PAYE, 18% pension, NSITF 1%, ITF 1% and NHF." },
  { href: "/tools/company-tax", icon: Building2, title: "Company tax & development levy", text: "The small-company test, 30% CIT, the 4% development levy and minimum ETR flags." },
  { href: "/tools/vat", icon: Receipt, title: "VAT calculator", text: "Add or remove 7.5% VAT on any amount." },
  { href: "/calendar", icon: CalendarDays, title: "Compliance deadline calendar", text: "Your filing dates for the next 12 months, downloadable to your calendar." },
];

export default function ToolsPage() {
  return (
    <>
      <PageHeader eyebrow="Compliance engine" title="Free calculators built on the 2026 tax laws" intro="Plan your payroll, tax and statutory levies with up-to-date rules. Free, with no sign-up." />
      <div className="container-x grid gap-5 py-16 md:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="card group flex flex-col p-6 transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-md">
            <span className="inline-flex w-fit rounded-lg bg-navy-50 p-2.5 text-navy-800">
              <t.icon size={22} />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-navy-950">{t.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{t.text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700">
              Open <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
