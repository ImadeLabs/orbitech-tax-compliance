import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(226,176,36,0.18),transparent_55%)]" />
      <div className="container-x relative py-14 sm:py-20">
        {eyebrow && <p className="text-xs font-semibold tracking-[0.18em] text-gold-300 uppercase">{eyebrow}</p>}
        <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-balance sm:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function CtaBand({
  title = "Not sure where your business stands?",
  text = "Take the free 3-minute Tax Year 2027 readiness check, or talk to a consultant in Abuja today.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="bg-gold-50">
      <div className="container-x flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-navy-950">{title}</h2>
          <p className="mt-2 max-w-2xl text-slate-700">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/readiness" className="btn-navy">
            Start readiness check <ArrowRight size={16} />
          </Link>
          <a href={whatsappLink("Hello Orbitech, I'd like to speak with a consultant.")} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export function Disclaimer() {
  return (
    <p className="text-xs leading-relaxed text-slate-500">
      Estimates are based on the Nigeria Tax Act 2025, the Nigeria Tax Administration Act 2025 and current payroll levy rules, effective 1 January 2026.
      They are for planning only and are not a filing. Your actual position depends on your full facts and any guidance NRS or FCT-IRS issue later.
    </p>
  );
}
