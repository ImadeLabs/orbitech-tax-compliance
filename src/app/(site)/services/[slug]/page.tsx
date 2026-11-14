import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Clock, FileText, MessageCircle } from "lucide-react";
import { SERVICE_BY_SLUG, SERVICES } from "@/lib/services";
import { whatsappLink } from "@/lib/site";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { PageHeader } from "@/components/site/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICE_BY_SLUG[slug];
  if (!s) return {};
  return { title: `${s.title} in Abuja`, description: s.short };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SERVICE_BY_SLUG[slug];
  if (!s) notFound();
  const related = SERVICES.filter((x) => x.category === s.category && x.slug !== s.slug).slice(0, 3);

  return (
    <>
      <PageHeader eyebrow={s.category} title={s.title} intro={s.intro}>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#enquire" className="btn-gold">
            Get started <ArrowRight size={16} />
          </a>
          <a href={whatsappLink(`Hello Orbitech, I need help with ${s.title}.`)} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
            <MessageCircle size={16} /> WhatsApp us
          </a>
        </div>
      </PageHeader>

      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-navy-950">Who needs this</h2>
            <ul className="mt-4 space-y-3">
              {s.whoNeeds.map((w) => (
                <li key={w} className="flex gap-3 text-slate-700">
                  <Check size={18} className="mt-0.5 shrink-0 text-emerald-600" /> {w}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-950">What&apos;s included</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {s.included.map((w) => (
                <li key={w} className="card flex gap-3 p-4 text-sm text-slate-700">
                  <Check size={18} className="shrink-0 text-navy-700" /> {w}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-950">Documents to have ready</h2>
            <ul className="mt-4 space-y-2.5">
              {s.documents.map((d) => (
                <li key={d} className="flex gap-3 text-slate-700">
                  <FileText size={18} className="mt-0.5 shrink-0 text-slate-400" /> {d}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-slate-500">Missing some of these? That&apos;s normal. We help you get or rebuild them.</p>
          </section>

          {s.deadline && (
            <section className="flex gap-4 rounded-2xl bg-gold-50 p-5">
              <Clock className="shrink-0 text-gold-600" />
              <div>
                <p className="font-semibold text-navy-950">Statutory deadline</p>
                <p className="text-slate-700">{s.deadline}</p>
                <Link href="/calendar" className="mt-1 inline-block text-sm font-semibold text-navy-700 hover:underline">
                  See all your deadlines →
                </Link>
              </div>
            </section>
          )}

          {s.tool && (
            <Link href={s.tool.href} className="card flex items-center justify-between gap-4 p-5 transition hover:border-navy-300">
              <span className="font-semibold text-navy-900">{s.tool.label}</span>
              <ArrowRight className="text-navy-700" />
            </Link>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-navy-950">Related services</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.slug} href={`/services/${r.slug}`} className="card p-4 text-sm font-semibold text-navy-900 hover:border-navy-300">
                    {r.title}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside id="enquire" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 text-xl font-bold text-navy-950">Request a quote</h2>
          <EnquiryForm compact defaultServices={[s.slug]} />
        </aside>
      </div>
    </>
  );
}
