import {
  MINIMUM_WAGE_MONTHLY,
  NHF_RATE,
  PENSION_EMPLOYEE_RATE,
  PIT_BANDS,
  RENT_RELIEF_CAP,
  RENT_RELIEF_RATE,
} from "./rules";

export type PitInput = {
  /** All amounts are ANNUAL naira. */
  basic: number;
  housing: number;
  transport: number;
  otherAllowances: number;
  annualRent: number;
  /** Include the 8% employee pension (default true). */
  pension?: boolean;
  /** Include NHF at 2.5% of basic (default false). */
  nhf?: boolean;
  nhis?: number;
  lifeInsurance?: number;
  mortgageInterest?: number;
};

export type BandLine = { from: number; to: number; rate: number; taxable: number; tax: number };

export type PitResult = {
  gross: number;
  pension: number;
  nhf: number;
  otherDeductions: number;
  rentRelief: number;
  chargeable: number;
  bands: BandLine[];
  annualTax: number;
  monthlyTax: number;
  effectiveRate: number;
  netAnnual: number;
  netMonthly: number;
  exemptMinimumWage: boolean;
};

const clamp = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
const round2 = (n: number) => Math.round(n * 100) / 100;

export function applyBands(chargeable: number): { bands: BandLine[]; tax: number } {
  const bands: BandLine[] = [];
  let lower = 0;
  let tax = 0;
  for (const band of PIT_BANDS) {
    const taxable = Math.max(0, Math.min(chargeable, band.upTo) - lower);
    const t = taxable * band.rate;
    bands.push({ from: lower, to: band.upTo, rate: band.rate, taxable, tax: round2(t) });
    tax += t;
    lower = band.upTo;
    if (chargeable <= band.upTo) break;
  }
  return { bands, tax: round2(tax) };
}

export function computePit(input: PitInput): PitResult {
  const basic = clamp(input.basic);
  const housing = clamp(input.housing);
  const transport = clamp(input.transport);
  const gross = basic + housing + transport + clamp(input.otherAllowances);

  const pension = input.pension === false ? 0 : round2((basic + housing + transport) * PENSION_EMPLOYEE_RATE);
  const nhf = input.nhf ? round2(basic * NHF_RATE) : 0;
  const otherDeductions = clamp(input.nhis ?? 0) + clamp(input.lifeInsurance ?? 0) + clamp(input.mortgageInterest ?? 0);
  const rentRelief = round2(Math.min(clamp(input.annualRent) * RENT_RELIEF_RATE, RENT_RELIEF_CAP));

  const exemptMinimumWage = gross > 0 && gross <= MINIMUM_WAGE_MONTHLY * 12;
  const chargeable = Math.max(0, gross - pension - nhf - otherDeductions - rentRelief);
  const { bands, tax } = applyBands(chargeable);
  const annualTax = exemptMinimumWage ? 0 : tax;

  const netAnnual = gross - pension - nhf - annualTax;
  return {
    gross,
    pension,
    nhf,
    otherDeductions,
    rentRelief,
    chargeable,
    bands,
    annualTax,
    monthlyTax: round2(annualTax / 12),
    effectiveRate: gross > 0 ? annualTax / gross : 0,
    netAnnual: round2(netAnnual),
    netMonthly: round2(netAnnual / 12),
    exemptMinimumWage,
  };
}
