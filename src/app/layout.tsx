import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Orbitech Tax & Compliance | Tax, ITF, NSITF & BPP Consultants in Abuja",
    template: "%s | Orbitech Tax & Compliance, Abuja",
  },
  description:
    "Abuja tax and compliance consultants. Get Tax Year 2027-ready under Nigeria's 2026 tax laws: CIT, VAT, PAYE, PenCom, ITF, NSITF, TCC and BPP registration for federal contracts.",
  keywords: [
    "tax consultant Abuja",
    "BPP registration Abuja",
    "ITF compliance certificate",
    "NSITF compliance certificate",
    "tax clearance certificate Abuja",
    "PAYE calculator 2026 Nigeria",
    "Nigeria Tax Act 2025",
    "FCT-IRS PAYE",
    "PenCom compliance certificate",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: site.name,
    title: "Get Tax Year 2027-ready | Orbitech Tax & Compliance, Abuja",
    description: "Free readiness check, 2026 PAYE calculator and federal contract compliance (TCC, PenCom, ITF, NSITF, BPP).",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#0a1530" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-white font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}
