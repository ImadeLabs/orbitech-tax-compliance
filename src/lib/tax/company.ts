import {
  CIT_RATE,
  DEVELOPMENT_LEVY_RATE,
  MIN_ETR_RATE,
  MIN_ETR_TURNOVER,
  SMALL_COMPANY_FIXED_ASSETS,
  SMALL_COMPANY_TURNOVER,
  VAT_RATE,
} from "./rules";

export type CompanyInput = {
  turnover: number;
  fixedAssets: number;
  /** Assessable / total profits for the year. */
  profit: number;
  professionalServices: boolean;
  partOfMultinational: boolean;
};

export type CompanyResult = {
  isSmall: boolean;
  smallReason: string;
  cit: number;
  citRate: number;
  developmentLevy: number;
  total: number;
  effectiveRateOnProfit: number;
  minimumEtrApplies: boolean;
  notes: string[];
};

const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
const r = (n: number) => Math.round(n * 100) / 100;

export function computeCompanyTax(input: CompanyInput): CompanyResult {
  const turnover = pos(input.turnover);
  const fixedAssets = pos(input.fixedAssets);
  const profit = pos(input.profit);

  let smallReason = "";
  let isSmall = turnover <= SMALL_COMPANY_TURNOVER && fixedAssets <= SMALL_COMPANY_FIXED_ASSETS;
  if (isSmall && input.professionalServices) {
    isSmall = false;
    smallReason = "Professional-services firms are excluded from small-company status regardless of size.";
  } else if (isSmall) {
    smallReason = "Turnover and fixed assets are within the small-company limits.";
  } else if (turnover > SMALL_COMPANY_TURNOVER) {
    smallReason = "Turnover is above the small-company limit.";
  } else {
    smallReason = "Fixed assets are above the small-company limit.";
  }

  const citRate = isSmall ? 0 : CIT_RATE;
  const cit = r(profit * citRate);
  const developmentLevy = isSmall ? 0 : r(profit * DEVELOPMENT_LEVY_RATE);
  const total = r(cit + developmentLevy);
  const minimumEtrApplies = input.partOfMultinational || turnover >= MIN_ETR_TURNOVER;

  const notes: string[] = [];
  if (isSmall) {
    notes.push("Small companies pay 0% CIT and are exempt from the development levy, but must still file returns every year.");
    notes.push("Small companies may also be exempt from charging VAT. Confirm your position before you stop charging it.");
  } else {
    notes.push(`CIT at ${CIT_RATE * 100}% plus the ${DEVELOPMENT_LEVY_RATE * 100}% development levy (which replaces TET, the IT levy, NASENI and Police Trust Fund levies).`);
    notes.push(`Register for VAT and charge ${VAT_RATE * 100}% on taxable supplies, filing by the 21st of each month.`);
  }
  if (minimumEtrApplies) {
    notes.push(`A ${MIN_ETR_RATE * 100}% minimum effective tax rate applies. Incentives that push your rate below it may trigger a top-up.`);
  }
  notes.push("Returns are due within 6 months of your financial year end. For a December year end, that is 30 June.");

  return {
    isSmall,
    smallReason,
    cit,
    citRate,
    developmentLevy,
    total,
    effectiveRateOnProfit: profit > 0 ? total / profit : 0,
    minimumEtrApplies,
    notes,
  };
}

export function computeVat(amount: number, mode: "add" | "extract") {
  const a = pos(amount);
  if (mode === "add") {
    const vat = r(a * VAT_RATE);
    return { net: a, vat, gross: r(a + vat) };
  }
  const net = r(a / (1 + VAT_RATE));
  return { net, vat: r(a - net), gross: a };
}
