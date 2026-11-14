import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/government-contracts", "/tax-reform", "/tools", "/tools/paye", "/tools/payroll", "/tools/company-tax", "/tools/vat", "/readiness", "/calendar", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : p === "/readiness" || p === "/government-contracts" ? 0.9 : 0.7 })),
    ...SERVICES.map((s) => ({ url: `${site.url}/services/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
