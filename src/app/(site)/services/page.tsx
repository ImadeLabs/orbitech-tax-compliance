import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICES, type ServiceCategory } from "@/lib/services";
import { CtaBand, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Tax & Compliance Services",
  description: "CIT, VAT, WHT, PAYE, PenCom, ITF, NSITF, TCC, BPP registration, CAC annual returns and bookkeeping for Abuja businesses.",
};

const ORDER: ServiceCategory[] = ["Tax", "Payroll levies", "Government contracts", "Corporate & accounts"];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Every filing, levy and certificate your business needs"
        intro="One team for your NRS, FCT-IRS, PenCom, ITF, NSITF, BPP and CAC obligations, built around the 2026 tax laws."
      />
      <div className="container-x space-y-16 py-16">
        {ORDER.map((cat) => (
          <section key={cat}>
            <h2 className="text-xl font-bold text-navy-950">{cat}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {SERVICES.filter((s) => s.category === cat).map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} className="card group flex flex-col p-6 transition hover:border-navy-300 hover:shadow-md">
                  <h3 className="text-lg font-semibold text-navy-950">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{s.short}</p>
                  {s.deadline && <p className="mt-4 text-xs font-medium text-gold-700">Deadline: {s.deadline}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700">
                    Details <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <CtaBand />
    </>
  );
}
