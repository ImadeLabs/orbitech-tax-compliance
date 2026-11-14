/**
 * Tax Year 2027 readiness engine.
 *
 * The first returns prepared fully under the 2026 tax laws (CIT for FY2026,
 * annual PAYE returns, ITF for 2026 payroll) all fall due in 2027. This scores a
 * business's current position and turns each gap into an action and a service.
 */

export type Answer = "yes" | "no" | "unsure";

export type Profile = {
  employees: number;
  turnoverBand: TurnoverBand;
  bidsForGovernment: boolean;
  sector: string;
};

export type TurnoverBand = "under-25m" | "25m-50m" | "50m-100m" | "100m-1b" | "1b-20b" | "over-20b";

export const TURNOVER_BANDS: { value: TurnoverBand; label: string; midpoint: number }[] = [
  { value: "under-25m", label: "Under ₦25m", midpoint: 15_000_000 },
  { value: "25m-50m", label: "₦25m – ₦50m", midpoint: 40_000_000 },
  { value: "50m-100m", label: "₦50m – ₦100m", midpoint: 75_000_000 },
  { value: "100m-1b", label: "₦100m – ₦1bn", midpoint: 400_000_000 },
  { value: "1b-20b", label: "₦1bn – ₦20bn", midpoint: 5_000_000_000 },
  { value: "over-20b", label: "Over ₦20bn", midpoint: 30_000_000_000 },
];

export type Question = {
  id: string;
  text: string;
  help: string;
  weight: number;
  service: string; // service slug
  action: string;
  appliesTo?: (p: Profile) => boolean;
  area: "Registration" | "Filing" | "Payroll levies" | "Contracts" | "Records";
};

const hasStaff = (p: Profile) => p.employees >= 1;

export const QUESTIONS: Question[] = [
  {
    id: "cac",
    area: "Registration",
    text: "Is your company registered with CAC, with annual returns up to date?",
    help: "Late CAC annual returns attract penalties and can get a company marked inactive.",
    weight: 8,
    service: "cac-annual-returns",
    action: "File outstanding CAC annual returns and update your statutory registers.",
  },
  {
    id: "tin",
    area: "Registration",
    text: "Do you have a valid Tax ID and access to the NRS (formerly FIRS) self-service portal?",
    help: "The Nigeria Revenue Service has replaced FIRS. Your Tax ID now covers both federal and state taxes.",
    weight: 8,
    service: "tax-health-check",
    action: "Confirm your Tax ID and set up portal access before you file anything in 2027.",
  },
  {
    id: "cit",
    area: "Filing",
    text: "Do you file company income tax returns within 6 months of your year end?",
    help: "Small companies pay 0% but must still file. Missing a filing triggers penalties and blocks your TCC.",
    weight: 12,
    service: "company-income-tax",
    action: "Prepare your FY2026 CIT and development levy computation now. It is due by 30 June 2027 for a December year end.",
  },
  {
    id: "vat",
    area: "Filing",
    text: "Are you VAT-registered and filing monthly by the 21st, including nil returns?",
    help: "Nil returns are still required. Under the 2025 Acts, input VAT on assets and services can now be recovered.",
    weight: 10,
    service: "vat-compliance",
    action: "Regularise VAT registration and set up a monthly return calendar that includes nil returns.",
    appliesTo: (p) => p.turnoverBand !== "under-25m",
  },
  {
    id: "wht",
    area: "Filing",
    text: "Do you deduct and remit withholding tax on qualifying payments by the 21st?",
    help: "WHT rates were reset by the 2024 regulations. Unremitted WHT is a debt the company owes to NRS.",
    weight: 7,
    service: "withholding-tax",
    action: "Review your vendor payments and apply the current WHT schedule.",
  },
  {
    id: "paye",
    area: "Payroll levies",
    text: "Is payroll updated for the 2026 PAYE bands and rent relief, with PAYE remitted to FCT-IRS by the 10th?",
    help: "The old CRA is gone. The first ₦800k is tax-free and rent relief is 20% of rent, capped at ₦500k.",
    weight: 12,
    service: "paye-payroll",
    action: "Re-run payroll on the 2026 bands, collect rent evidence from staff and prepare the annual returns due 31 January 2027.",
    appliesTo: hasStaff,
  },
  {
    id: "pension",
    area: "Payroll levies",
    text: "Do you remit pension (10% employer + 8% employee) within 7 working days of payday?",
    help: "Required with 3 or more employees. You need a PenCom compliance certificate for government jobs.",
    weight: 9,
    service: "pencom-compliance",
    action: "Clear any pension arrears, set up group life cover and obtain a PenCom compliance certificate.",
    appliesTo: (p) => p.employees >= 3,
  },
  {
    id: "nsitf",
    area: "Payroll levies",
    text: "Are you registered with NSITF and paying 1% of your monthly payroll?",
    help: "Employees' Compensation Act contribution. You need an NSITF certificate for every federal tender.",
    weight: 8,
    service: "nsitf-compliance",
    action: "Register with NSITF, reconcile your contributions and obtain a clearance certificate.",
    appliesTo: hasStaff,
  },
  {
    id: "itf",
    area: "Payroll levies",
    text: "Are you registered with ITF and paying 1% of annual payroll by 1 April?",
    help: "Applies with 5+ staff or turnover of ₦50m+. Up to 50% can be reclaimed if you train your staff.",
    weight: 8,
    service: "itf-compliance",
    action: "Register with ITF (Form 7A) and file your 2026 payroll contribution by 1 April 2027.",
    appliesTo: (p) => p.employees >= 5 || ["50m-100m", "100m-1b", "1b-20b", "over-20b"].includes(p.turnoverBand),
  },
  {
    id: "tcc",
    area: "Contracts",
    text: "Do you hold a current Tax Clearance Certificate covering the last 3 years?",
    help: "Banks, MDAs and large clients ask for a TCC. You cannot get one with any filing gap.",
    weight: 8,
    service: "tax-clearance-certificate",
    action: "Close any filing gaps, then apply for your 2027 TCC early in January.",
  },
  {
    id: "bpp",
    area: "Contracts",
    text: "Are you registered with BPP (an IRR on the National Database of Federal Contractors)?",
    help: "Mandatory for federal contracts. BPP needs your TCC, PenCom, ITF and NSITF certificates.",
    weight: 10,
    service: "bpp-registration",
    action: "Assemble the full federal contract pack and register or renew with BPP.",
    appliesTo: (p) => p.bidsForGovernment,
  },
  {
    id: "books",
    area: "Records",
    text: "Do you keep digital books and produce annual financial statements?",
    help: "The 2025 Administration Act moves towards e-invoicing and fiscalisation. Paper records will not keep up.",
    weight: 10,
    service: "bookkeeping-accounts",
    action: "Move to digital bookkeeping and get your FY2026 financial statements ready.",
  },
];

export type ReadinessResult = {
  score: number;
  grade: "Ready" | "Nearly ready" | "At risk" | "High risk";
  gaps: { id: string; area: Question["area"]; action: string; service: string; severity: "high" | "medium"; answer: Answer }[];
  strengths: string[];
  applicable: number;
  isSmallCompanyCandidate: boolean;
  priority: "hot" | "warm" | "cold";
};

export function applicableQuestions(profile: Profile) {
  return QUESTIONS.filter((q) => !q.appliesTo || q.appliesTo(profile));
}

export function scoreReadiness(profile: Profile, answers: Record<string, Answer | undefined>): ReadinessResult {
  const qs = applicableQuestions(profile);
  let total = 0;
  let earned = 0;
  const gaps: ReadinessResult["gaps"] = [];
  const strengths: string[] = [];

  for (const q of qs) {
    total += q.weight;
    const a = answers[q.id] ?? "unsure";
    if (a === "yes") {
      earned += q.weight;
      strengths.push(q.text);
    } else {
      if (a === "unsure") earned += q.weight * 0.25;
      gaps.push({
        id: q.id,
        area: q.area,
        action: q.action,
        service: q.service,
        severity: q.weight >= 10 || a === "no" ? "high" : "medium",
        answer: a,
      });
    }
  }

  const score = total ? Math.round((earned / total) * 100) : 0;
  const grade = score >= 85 ? "Ready" : score >= 65 ? "Nearly ready" : score >= 40 ? "At risk" : "High risk";
  gaps.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1));

  const bigBusiness = ["100m-1b", "1b-20b", "over-20b"].includes(profile.turnoverBand);
  const priority: ReadinessResult["priority"] =
    (gaps.length >= 3 && (bigBusiness || profile.bidsForGovernment || profile.employees >= 10)) || gaps.length >= 6
      ? "hot"
      : gaps.length >= 2
        ? "warm"
        : "cold";

  return {
    score,
    grade,
    gaps,
    strengths,
    applicable: qs.length,
    isSmallCompanyCandidate: profile.turnoverBand === "under-25m" || profile.turnoverBand === "25m-50m",
    priority,
  };
}
