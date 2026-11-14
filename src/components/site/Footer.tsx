import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { site, whatsappLink } from "@/lib/site";
import { SERVICES } from "@/lib/services";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            Tax, payroll levy and federal contract compliance for businesses in Abuja and across Nigeria, built for the 2026 tax laws.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-gold-300" /> {site.address || site.city}
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white">
                <Phone size={16} className="text-gold-300" /> {site.phone}
              </a>
            </li>
            <li>
              <a href={whatsappLink("Hello Orbitech, I'd like to talk about tax compliance.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                <MessageCircle size={16} className="text-gold-300" /> WhatsApp us
              </a>
            </li>
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-white">
                  <Mail size={16} className="text-gold-300" /> {site.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold-300">Tax & payroll</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {SERVICES.filter((s) => s.category === "Tax" || s.category === "Payroll levies").map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-white">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold-300">Contracts & corporate</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {SERVICES.filter((s) => s.category === "Government contracts" || s.category === "Corporate & accounts").map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-white">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold-300">Free tools</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/readiness" className="hover:text-white">Tax Year 2027 readiness check</Link></li>
            <li><Link href="/tools/paye" className="hover:text-white">PAYE calculator (2026 bands)</Link></li>
            <li><Link href="/tools/payroll" className="hover:text-white">Payroll cost: pension, NSITF, ITF</Link></li>
            <li><Link href="/tools/company-tax" className="hover:text-white">CIT & development levy</Link></li>
            <li><Link href="/tools/vat" className="hover:text-white">VAT calculator</Link></li>
            <li><Link href="/calendar" className="hover:text-white">Compliance deadline calendar</Link></li>
            <li><Link href="/tax-reform" className="hover:text-white">2026 tax reform explained</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Calculator results are estimates for planning only. Get advice before filing.</p>
        </div>
      </div>
    </footer>
  );
}
