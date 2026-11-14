import { MessageCircle } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Tracker } from "@/components/site/Tracker";
import { site, whatsappLink } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AccountingService",
  name: site.name,
  url: site.url,
  telephone: site.phone,
  areaServed: [{ "@type": "City", name: "Abuja" }, { "@type": "Country", name: "Nigeria" }],
  address: { "@type": "PostalAddress", addressLocality: "Abuja", addressRegion: "FCT", addressCountry: "NG", ...(site.address ? { streetAddress: site.address } : {}) },
  knowsAbout: ["Company Income Tax", "VAT", "PAYE", "PenCom", "ITF", "NSITF", "BPP registration", "Tax Clearance Certificate", "Nigeria Tax Act 2025"],
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Tracker />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <a
        href={whatsappLink("Hello Orbitech, I'd like help with tax compliance.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white shadow-lg shadow-black/15 transition hover:scale-105 sm:right-6 sm:bottom-6"
      >
        <MessageCircle size={22} />
        <span className="hidden text-sm sm:inline">Chat on WhatsApp</span>
      </a>
    </>
  );
}
