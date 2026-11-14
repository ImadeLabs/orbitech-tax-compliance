import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { PageHeader } from "@/components/site/ui";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Book a Consultation",
  description: "Book a free consultation with Orbitech Tax & Compliance in Abuja: tax, PAYE, PenCom, ITF, NSITF, TCC and BPP registration.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Book a free consultation" intro="Tell us about your business. A consultant will call or WhatsApp you within one business day." />
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-5">
          <a href={whatsappLink("Hello Orbitech, I'd like to book a consultation.")} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-5 transition hover:border-emerald-300">
            <span className="rounded-full bg-[#25D366]/10 p-3 text-[#128C7E]">
              <MessageCircle />
            </span>
            <span>
              <span className="block font-semibold text-navy-950">WhatsApp (fastest)</span>
              <span className="text-sm text-slate-600">{site.phone}</span>
            </span>
          </a>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="card flex items-center gap-4 p-5 transition hover:border-navy-300">
            <span className="rounded-full bg-navy-50 p-3 text-navy-800">
              <Phone />
            </span>
            <span>
              <span className="block font-semibold text-navy-950">Call us</span>
              <span className="text-sm text-slate-600">{site.phone}</span>
            </span>
          </a>
          {site.email && (
            <a href={`mailto:${site.email}`} className="card flex items-center gap-4 p-5 transition hover:border-navy-300">
              <span className="rounded-full bg-navy-50 p-3 text-navy-800">
                <Mail />
              </span>
              <span>
                <span className="block font-semibold text-navy-950">Email</span>
                <span className="text-sm text-slate-600">{site.email}</span>
              </span>
            </a>
          )}
          <div className="card space-y-3 p-5 text-sm text-slate-700">
            <p className="flex items-center gap-3">
              <MapPin size={18} className="text-gold-600" /> {site.address || site.city}
            </p>
            <p className="flex items-center gap-3">
              <Clock size={18} className="text-gold-600" /> {site.hours}
            </p>
          </div>
        </div>
        <EnquiryForm />
      </div>
    </>
  );
}
