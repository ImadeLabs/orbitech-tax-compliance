export const site = {
  name: "Orbitech Tax & Compliance",
  shortName: "Orbitech",
  tagline: "Tax, payroll levies & federal contract compliance for Abuja businesses",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://orbitech-tax-compliance-n4yz.vercel.app",
  city: "Abuja, FCT",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+234 703 781 9477",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "2347037819477",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "",
  hours: "Mon – Fri, 8:00am – 6:00pm",
};

export function whatsappLink(text?: string, number = site.whatsapp) {
  const n = number.replace(/\D/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const ABUJA_AREAS = [
  "Wuse / Wuse II",
  "Maitama",
  "Garki",
  "Asokoro",
  "Central Business District",
  "Jabi",
  "Utako",
  "Wuye",
  "Gwarinpa",
  "Life Camp",
  "Katampe / Jahi",
  "Kubwa",
  "Lugbe / Airport Road",
  "Lokogoma / Galadimawa",
  "Apo / Gudu",
  "Kado / Dawaki",
  "Durumi",
  "Karu / Nyanya / Mararaba",
  "Gwagwalada / Kuje",
  "Outside Abuja",
] as const;

export const SECTORS = [
  "Construction & contractors",
  "NGO / development partner",
  "Hotels & hospitality",
  "Schools & education",
  "Healthcare & pharmacy",
  "Real estate & facility management",
  "Tech & startups",
  "Professional services",
  "Oil & gas services",
  "Retail & distribution",
  "Manufacturing",
  "Other",
] as const;
