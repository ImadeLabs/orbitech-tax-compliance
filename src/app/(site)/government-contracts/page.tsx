import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleAlert, FileCheck, MessageCircle } from "lucide-react";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { PageHeader } from "@/components/site/ui";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "BPP Registration, ITF & NSITF Certificates for Federal Contracts",
  description:
    "Federal Contract Compliance Pack for Abuja contractors: TCC, PenCom, ITF, NSITF and BPP IRR, prepared, renewed and tracked so your bids pass opening.",
};

const PACK = [
  { title: "Tax Clearance Certificate", agency: "NRS", text: "Covers the last 3 years. Any filing gap, even a nil VAT return, blocks it.", slug: "tax-clearance-certificate" },
  { title: "PenCom Compliance Certificate", agency: "PenCom", text: "Proof of pension remittance and group life cover for your staff.", slug: "pencom-compliance" },
  { title: "ITF Compliance Certificate", agency: "Industrial Training Fund", text: "1% of annual payroll, paid by 1 April. Issued by the Abuja area office.", slug: "itf-compliance" },
  { title: "NSITF Compliance Certificate", agency: "NSITF", text: "1% of monthly payroll under the Employees' Compensation Act.", slug: "nsitf-compliance" },
  { title: "BPP Registration (IRR)", agency: "Bureau of Public Procurement", text: "Your listing on the National Database of Federal Contractors. MDAs verify it at bid opening.", slug: "bpp-registration" },
  { title: "CAC Status & Annual Returns", agency: "CAC", text: "An active status, current annual returns and up-to-date director records.", slug: "cac-annual-returns" },
];

const FAILS = [
  "The ITF certificate expired between registering and bid submission",
  "NSITF contributions were never registered, so no certificate can be issued",
  "A TCC was refused over unfiled nil VAT returns",
  "The BPP IRR is out of date after a change of directors",
  "PenCom arrears from earlier years block a new certificate",
  "CAC shows 'inactive' because annual returns are overdue",
];

export default function GovernmentContractsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Federal Contract Compliance · Abuja"
        title="Get your bid past opening, every time"
        intro="Most disqualified bids fail on paperwork, not price. We prepare, renew and track every certificate a federal MDA will check: TCC, PenCom, ITF, NSITF, BPP and CAC."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#enquire" className="btn-gold">
            Check my contract readiness <ArrowRight size={16} />
          </a>
          <a href={whatsappLink("Hello Orbitech, I have a federal tender coming up and need my compliance certificates.")} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
            <MessageCircle size={16} /> Urgent tender? WhatsApp
          </a>
        </div>
      </PageHeader>

      <section className="py-16">
        <div className="container-x">
          <h2 className="h-section">The Federal Contract Compliance Pack</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            Each document depends on the others. NSITF and ITF need your CAC and payroll records, BPP needs all of them, and a TCC depends on clean filing history.
            We work through them in the right order so nothing stalls.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PACK.map((p, i) => (
              <Link key={p.slug} href={`/services/${p.slug}`} className="card group p-6 transition hover:border-navy-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-gold-300">{i + 1}</span>
                  <span className="text-xs font-medium text-slate-500">{p.agency}</span>
                </div>
                <h3 className="mt-4 font-semibold text-navy-950">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700">
                  Details <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="h-section">Why bids get disqualified</h2>
            <p className="mt-3 text-slate-600">These are the problems we fix most often for contractors in Abuja:</p>
            <ul className="mt-6 space-y-3">
              {FAILS.map((f) => (
                <li key={f} className="flex gap-3 text-slate-700">
                  <CircleAlert size={18} className="mt-0.5 shrink-0 text-red-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-navy-950">What you get</h3>
            <ul className="mt-5 space-y-3.5">
              {[
                "A document audit and a written gap list",
                "Processing of every missing or expired certificate",
                "BPP registration or renewal, with your IRR retrieved",
                "A certificate expiry tracker, with reminders well before each expires",
                "A tender-ready digital folder for every bid",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-[15px] text-slate-700">
                  <FileCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/tools/payroll" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">
              Estimate your ITF & NSITF contributions <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section id="enquire" className="scroll-mt-20 py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="h-section">Have a tender coming up?</h2>
            <p className="mt-3 text-slate-600">
              Tell us the closing date and what you already have. We&apos;ll tell you what can be done in time, honestly, before you pay anything.
            </p>
          </div>
          <EnquiryForm
            defaultServices={["bpp-registration", "itf-compliance", "nsitf-compliance"]}
            messagePlaceholder="e.g. Tender with FMoW closes 12 Dec. We have CAC and TCC but no ITF/NSITF certificates."
          />
        </div>
      </section>
    </>
  );
}
