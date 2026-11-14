import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  CalendarDays,
  Check,
  FileCheck,
  GraduationCap,
  HardHat,
  HeartHandshake,
  Hospital,
  Hotel,
  House,
  Landmark,
  Laptop,
  MessageCircle,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { DaysUntil } from "@/components/site/Countdown";
import { SERVICES } from "@/lib/services";
import { formatDate } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";

const KEY_2027 = [
  { date: "2027-01-31", label: "Annual PAYE returns for 2026", note: "Under the new PAYE bands · FCT-IRS" },
  { date: "2027-04-01", label: "ITF 1% on 2026 payroll", note: "Plus your ITF certificate for tenders" },
  { date: "2027-06-30", label: "CIT + 4% development levy", note: "FY2026, the first full year under the new Act" },
];

const CHANGES = [
  { icon: Users, title: "New PAYE bands", text: "The first ₦800,000 is tax-free and rates run from 15% to 25%. The old CRA is replaced by rent relief: 20% of rent, capped at ₦500,000." },
  { icon: Building2, title: "0% for small companies", text: "Companies with turnover up to ₦50m and fixed assets up to ₦250m pay no CIT. Professional-services firms do not qualify." },
  { icon: Receipt, title: "4% development levy", text: "One levy on assessable profits replaces TET, the IT levy, NASENI and the Police Trust Fund levy. Small companies are exempt." },
  { icon: Landmark, title: "NRS replaces FIRS", text: "The Nigeria Revenue Service now administers federal taxes, with tougher penalties and a move to e-invoicing." },
];

const PACK = [
  { label: "Tax Clearance Certificate (3 years)", slug: "tax-clearance-certificate" },
  { label: "PenCom compliance certificate", slug: "pencom-compliance" },
  { label: "ITF compliance certificate", slug: "itf-compliance" },
  { label: "NSITF compliance certificate", slug: "nsitf-compliance" },
  { label: "BPP Interim Registration Report (IRR)", slug: "bpp-registration" },
  { label: "CAC status report & annual returns", slug: "cac-annual-returns" },
];

const INDUSTRIES = [
  { icon: HardHat, label: "Construction & contractors" },
  { icon: HeartHandshake, label: "NGOs & development partners" },
  { icon: Hotel, label: "Hotels & hospitality" },
  { icon: GraduationCap, label: "Private schools" },
  { icon: Hospital, label: "Hospitals & pharmacies" },
  { icon: House, label: "Real estate & facility mgmt" },
  { icon: Laptop, label: "Tech & startups" },
  { icon: Scale, label: "Professional firms" },
];

const STEPS = [
  { title: "Free readiness check", text: "Answer 12 questions online or on a call. You get a score and a list of your gaps straight away." },
  { title: "Written gap report", text: "We review your documents and send a fixed-scope plan with clear fees before any work starts." },
  { title: "We file & obtain certificates", text: "We handle NRS, FCT-IRS, PenCom, ITF, NSITF, CAC and BPP for you, and send you evidence of every filing." },
  { title: "Stay compliant all year", text: "A monthly calendar and reminders before every deadline, so you are always ready for a TCC or a tender." },
];

const FAQS = [
  {
    q: "What does \"Tax Year 2027\" mean for my business?",
    a: "The Nigeria Tax Act 2025 and Tax Administration Act 2025 took effect on 1 January 2026. Your 2026 activity is taxed under the new rules, and the returns for it fall due in 2027: annual PAYE returns in January, ITF in April and CIT plus the development levy in June for a December year end. Mistakes made now show up then.",
  },
  {
    q: "Do I need ITF and NSITF certificates to bid for federal contracts?",
    a: "Yes. Federal MDAs and BPP registration normally ask for current TCC, PenCom, ITF and NSITF compliance certificates, plus your CAC documents. A missing or expired certificate is one of the most common reasons a bid is disqualified at opening.",
  },
  {
    q: "We're a small company. Do we still need to file?",
    a: "Yes. Small companies may pay 0% CIT and be exempt from the development levy, but they must still file annual returns. Without those returns you cannot get a TCC.",
  },
  {
    q: "Do you only work with businesses in Abuja?",
    a: `We are based in ${site.city} and handle FCT-IRS, the ITF and NSITF Abuja offices and BPP in person. We also support clients anywhere in Nigeria online.`,
  },
  {
    q: "How much do your services cost?",
    a: "Fees depend on scope: your number of staff, how many years of filings need cleaning up and which certificates you need. After the free check we send a fixed quote, so there are no surprises.",
  },
];

export default function Home() {
  const featured = SERVICES.filter((s) => s.featured);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(226,176,36,0.22),transparent_50%),radial-gradient(ellipse_at_0%_100%,rgba(58,91,163,0.35),transparent_55%)]" />
        <div className="container-x relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/30 bg-gold-300/10 px-3 py-1.5 text-xs font-semibold text-gold-200">
              <span className="size-1.5 rounded-full bg-gold-300" /> Abuja · New tax laws in force since 1 Jan 2026
            </p>
            <h1 className="mt-6 text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-6xl">
              Your first returns under Nigeria&apos;s new tax laws are due in <span className="text-gold-300">2027</span>. Be ready.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              Orbitech keeps Abuja businesses compliant across CIT, VAT, PAYE, PenCom, <strong className="text-white">ITF</strong>, <strong className="text-white">NSITF</strong> and{" "}
              <strong className="text-white">BPP</strong>. That keeps your TCC clean and your federal tenders eligible.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/readiness" className="btn-gold px-6 py-3.5 text-base">
                Get your free readiness score <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="btn-ghost-light px-6 py-3.5 text-base">
                Book a consultation
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              {["3-minute check, no sign-up", "Fixed quotes before any work", "Reply within 1 business day"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check size={16} className="text-gold-300" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Tax Year 2027: key deadlines</p>
              <CalendarDays size={18} className="text-gold-300" />
            </div>
            <ul className="mt-5 space-y-4">
              {KEY_2027.map((k) => (
                <li key={k.date} className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-white">{k.label}</p>
                    <p className="mt-0.5 text-sm text-white/60">{k.note}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gold-300">
                      {formatDate(`${k.date}T12:00:00Z`)}
                    </p>
                    <p className="text-xs text-white/50">
                      <DaysUntil date={k.date} />
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-lg bg-white/5 p-3 text-xs leading-relaxed text-white/60">
              Plus every month: PAYE by the 10th, VAT and WHT by the 21st, pension within 7 working days of payday, and NSITF.
            </p>
            <Link href="/calendar" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-300 hover:text-gold-200">
              See your full compliance calendar <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-navy-950/60">
          <div className="container-x flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-5 text-xs font-semibold tracking-[0.16em] text-white/45 uppercase">
            <span className="text-white/60">We handle</span>
            {["NRS", "FCT-IRS", "PenCom", "ITF", "NSITF", "BPP", "CAC"].map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT CHANGED */}
      <section className="py-20">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Nigeria Tax Act 2025</p>
              <h2 className="h-section mt-2">What changed on 1 January 2026</h2>
            </div>
            <Link href="/tax-reform" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-navy-900">
              Full reform guide <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CHANGES.map((c) => (
              <div key={c.title} className="card p-6">
                <span className="inline-flex rounded-lg bg-navy-50 p-2.5 text-navy-800">
                  <c.icon size={22} />
                </span>
                <h3 className="mt-4 font-semibold text-navy-950">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEDERAL CONTRACT PACK */}
      <section className="bg-slate-50 py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">For contractors in Abuja</p>
            <h2 className="h-section mt-2">A tender is only as strong as your certificates</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Federal MDAs reject bids at opening over an expired ITF certificate, a missing NSITF clearance or an outdated BPP IRR. We put together and renew your
              complete <strong className="text-navy-900">Federal Contract Compliance Pack</strong>, and remind you before anything expires.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/government-contracts" className="btn-navy">
                See the contract pack <ArrowRight size={16} />
              </Link>
              <a href={whatsappLink("Hello Orbitech, I need help with BPP/ITF/NSITF certificates for a tender.")} target="_blank" rel="noopener noreferrer" className="btn-outline">
                <MessageCircle size={16} /> Tender deadline? WhatsApp us
              </a>
            </div>
          </div>
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-gold-500" size={28} />
              <p className="font-semibold text-navy-950">Federal Contract Compliance Pack</p>
            </div>
            <ul className="mt-6 divide-y divide-slate-100">
              {PACK.map((p) => (
                <li key={p.slug}>
                  <Link href={`/services/${p.slug}`} className="group flex items-center justify-between py-3.5">
                    <span className="flex items-center gap-3 text-[15px] text-slate-700">
                      <FileCheck size={18} className="text-emerald-600" /> {p.label}
                    </span>
                    <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-navy-700" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20">
        <div className="container-x">
          <p className="eyebrow">Services</p>
          <h2 className="h-section mt-2">End-to-end tax & statutory compliance</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="card group flex flex-col p-6 transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-md">
                <span className="text-xs font-semibold text-gold-600">{s.category}</span>
                <h3 className="mt-2 text-lg font-semibold text-navy-950">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{s.short}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy-700">
                  Learn more <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/services" className="btn-outline">
              View all {SERVICES.length} services
            </Link>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="bg-navy-950 py-20 text-white">
        <div className="container-x">
          <p className="text-xs font-semibold tracking-[0.18em] text-gold-300 uppercase">Free compliance engine</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Run the numbers on the 2026 rules</h2>
          <p className="mt-3 max-w-2xl text-white/70">Calculators built on the Nigeria Tax Act 2025 and current payroll levy rates. Free, no sign-up needed.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { href: "/readiness", title: "2027 readiness score", text: "12 questions, instant gap report", icon: BadgeCheck, hl: true },
              { href: "/tools/paye", title: "PAYE calculator", text: "New bands, rent relief, net pay", icon: Calculator },
              { href: "/tools/payroll", title: "Payroll cost", text: "Pension, NSITF, ITF, NHF per staff", icon: Users },
              { href: "/tools/company-tax", title: "Company tax", text: "Small-company test, CIT, dev levy", icon: Building2 },
              { href: "/calendar", title: "Deadline calendar", text: "Your next 12 months of filings", icon: CalendarDays },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`group rounded-2xl border p-5 transition hover:-translate-y-0.5 ${t.hl ? "border-gold-300/40 bg-gold-300/10" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"}`}
              >
                <t.icon className={t.hl ? "text-gold-300" : "text-white/80"} size={24} />
                <h3 className="mt-4 font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-white/60">{t.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20">
        <div className="container-x">
          <p className="eyebrow">How we work</p>
          <h2 className="h-section mt-2">From gap to compliant in four steps</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card p-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-gold-100 font-bold text-gold-700">{i + 1}</span>
                <h3 className="mt-4 font-semibold text-navy-950">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="bg-slate-50 py-20">
        <div className="container-x">
          <p className="eyebrow">Who we serve</p>
          <h2 className="h-section mt-2">Built around Abuja&apos;s economy</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {INDUSTRIES.map((i) => (
              <div key={i.label} className="card flex items-center gap-3 p-4 sm:p-5">
                <i.icon size={22} className="shrink-0 text-navy-700" />
                <span className="text-sm font-medium text-slate-800">{i.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + CONTACT */}
      <section className="py-20" id="contact">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="h-section mt-2">Questions Abuja businesses ask us</h2>
            <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-navy-950">
                    {f.q}
                    <span className="mt-0.5 text-xl leading-none text-slate-400 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Free consultation</p>
            <h2 className="h-section mt-2">Talk to a consultant</h2>
            <p className="mt-3 mb-6 text-slate-600">Tell us what you need. We&apos;ll reply within one business day with next steps and a fixed quote.</p>
            <EnquiryForm compact />
          </div>
        </div>
      </section>
    </>
  );
}
