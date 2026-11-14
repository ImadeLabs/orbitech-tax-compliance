export type Obligation =
  | "paye"
  | "vat"
  | "wht"
  | "pension"
  | "nsitf"
  | "itf"
  | "cit"
  | "paye-annual"
  | "pit-self"
  | "tcc"
  | "bpp";

export const OBLIGATIONS: Record<Obligation, { label: string; agency: string; service: string; rule: string }> = {
  paye: { label: "PAYE remittance", agency: "FCT-IRS / State IRS", service: "paye-payroll", rule: "10th of the following month" },
  vat: { label: "VAT return & payment", agency: "NRS", service: "vat-compliance", rule: "21st of the following month (nil returns too)" },
  wht: { label: "WHT remittance", agency: "NRS / State IRS", service: "withholding-tax", rule: "21st of the following month" },
  pension: { label: "Pension remittance", agency: "PFA / PenCom", service: "pencom-compliance", rule: "Within 7 working days of payday" },
  nsitf: { label: "NSITF contribution", agency: "NSITF", service: "nsitf-compliance", rule: "Monthly, 1% of payroll" },
  itf: { label: "ITF 1% annual contribution", agency: "ITF", service: "itf-compliance", rule: "By 1 April, for the previous year's payroll" },
  cit: { label: "CIT & development levy returns", agency: "NRS", service: "company-income-tax", rule: "Within 6 months of year end" },
  "paye-annual": { label: "Employer annual PAYE returns", agency: "FCT-IRS / State IRS", service: "paye-payroll", rule: "31 January" },
  "pit-self": { label: "Individual self-assessment returns", agency: "FCT-IRS / State IRS", service: "paye-payroll", rule: "31 March" },
  tcc: { label: "Tax Clearance Certificate renewal", agency: "NRS", service: "tax-clearance-certificate", rule: "Each January" },
  bpp: { label: "BPP registration renewal", agency: "BPP", service: "bpp-registration", rule: "Annually, with fresh certificates" },
};

export type Deadline = { date: string; obligation: Obligation; label: string; agency: string; period: string; service: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Last day of month m (0-based) — e.g. for a FYE. */
function lastDay(y: number, m: number) {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}

export function buildDeadlines(opts: {
  from: Date;
  months: number;
  obligations: Obligation[];
  /** Financial year end month, 0-based (11 = December). */
  fyeMonth?: number;
}): Deadline[] {
  const set = new Set(opts.obligations);
  const fye = opts.fyeMonth ?? 11;
  const start = new Date(Date.UTC(opts.from.getUTCFullYear(), opts.from.getUTCMonth(), opts.from.getUTCDate()));
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + opts.months, start.getUTCDate()));
  const out: Deadline[] = [];

  const push = (y: number, m: number, d: number, ob: Obligation, period: string) => {
    const date = iso(y, m, d);
    const t = Date.UTC(y, m, d);
    if (t < start.getTime() || t >= end.getTime()) return;
    const o = OBLIGATIONS[ob];
    out.push({ date, obligation: ob, label: o.label, agency: o.agency, period, service: o.service });
  };

  for (let i = -1; i <= opts.months + 1; i++) {
    const ref = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const y = ref.getUTCFullYear();
    const m = ref.getUTCMonth();
    const prev = new Date(Date.UTC(y, m - 1, 1));
    const prevLabel = `${MONTHS[prev.getUTCMonth()]} ${prev.getUTCFullYear()}`;

    if (set.has("paye")) push(y, m, 10, "paye", prevLabel);
    if (set.has("vat")) push(y, m, 21, "vat", prevLabel);
    if (set.has("wht")) push(y, m, 21, "wht", prevLabel);
    if (set.has("nsitf")) push(y, m, lastDay(y, m), "nsitf", `${MONTHS[m]} ${y}`);
    if (set.has("pension")) push(y, m, Math.min(lastDay(y, m), 7), "pension", `${prevLabel} salaries (if paid at month end)`);

    if (m === 0) {
      if (set.has("paye-annual")) push(y, 0, 31, "paye-annual", `Year ${y - 1}`);
      if (set.has("tcc")) push(y, 0, 15, "tcc", `TCC ${y} (covers ${y - 3}–${y - 1})`);
      if (set.has("bpp")) push(y, 0, 31, "bpp", `IRR ${y}`);
    }
    if (m === 2 && set.has("pit-self")) push(y, 2, 31, "pit-self", `Year ${y - 1}`);
    if (m === 3 && set.has("itf")) push(y, 3, 1, "itf", `${y - 1} payroll`);

    // CIT: 6 months after FYE month.
    if (set.has("cit") && m === (fye + 6) % 12) {
      const fyYear = fye + 6 >= 12 ? y - 1 : y;
      push(y, m, lastDay(y, m), "cit", `FY ending ${MONTHS[fye]} ${fyYear}`);
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
}
