/**
 * Statutory parameters used by the Orbitech compliance engine.
 *
 * Every number the calculators use lives here, so a change in law (or a
 * clarification from NRS / a state IRS) is a one-line edit. Figures reflect the
 * Nigeria Tax Act 2025 and Nigeria Tax Administration Act 2025 (effective
 * 1 January 2026) plus the standing payroll levies.
 *
 * Items marked `review` are where published summaries disagree; confirm them
 * against the gazetted text before relying on them for a filing.
 */

export const RULES_EFFECTIVE_FROM = "2026-01-01";
export const RULES_LAST_REVIEWED = "2026-11-14";

/** Personal income tax — Nigeria Tax Act 2025, annual bands. */
export const PIT_BANDS: ReadonlyArray<{ upTo: number; rate: number }> = [
  { upTo: 800_000, rate: 0 },
  { upTo: 3_000_000, rate: 0.15 },
  { upTo: 12_000_000, rate: 0.18 },
  { upTo: 25_000_000, rate: 0.21 },
  { upTo: 50_000_000, rate: 0.23 },
  { upTo: Infinity, rate: 0.25 },
];

/** Rent relief replaces the old Consolidated Relief Allowance. */
export const RENT_RELIEF_RATE = 0.2;
export const RENT_RELIEF_CAP = 500_000;

/** Earners at or below the national minimum wage are exempt (₦70,000/month). */
export const MINIMUM_WAGE_MONTHLY = 70_000;

/** Pension Reform Act 2014 — employers with 3 or more staff. Base: basic + housing + transport. */
export const PENSION_EMPLOYER_RATE = 0.1;
export const PENSION_EMPLOYEE_RATE = 0.08;
export const PENSION_MIN_EMPLOYEES = 3;

/** National Housing Fund — 2.5% of basic salary, employee contribution. */
export const NHF_RATE = 0.025;

/** Employees' Compensation Act 2010 — NSITF, 1% of total monthly payroll, paid by employer. */
export const NSITF_RATE = 0.01;

/** Industrial Training Fund Act (as amended 2011) — 1% of annual payroll. */
export const ITF_RATE = 0.01;
export const ITF_MIN_EMPLOYEES = 5;
export const ITF_MIN_TURNOVER = 50_000_000;

/** Companies — Nigeria Tax Act 2025. */
export const CIT_RATE = 0.3;
export const SMALL_COMPANY_CIT_RATE = 0;
/**
 * review: EY and KPMG summaries of the signed Act give ₦50m; some later
 * commentary cites ₦100m. Kept conservative until confirmed.
 */
export const SMALL_COMPANY_TURNOVER = 50_000_000;
export const SMALL_COMPANY_FIXED_ASSETS = 250_000_000;
export const DEVELOPMENT_LEVY_RATE = 0.04;
export const MIN_ETR_RATE = 0.15;
export const MIN_ETR_TURNOVER = 20_000_000_000;

/** VAT */
export const VAT_RATE = 0.075;

export const SOURCES = [
  "Nigeria Tax Act 2025 (No. 7)",
  "Nigeria Tax Administration Act 2025",
  "Pension Reform Act 2014",
  "Employees' Compensation Act 2010",
  "Industrial Training Fund (Amendment) Act 2011",
  "National Housing Fund Act",
] as const;
