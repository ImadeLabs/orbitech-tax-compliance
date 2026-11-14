import { describe, expect, it } from "vitest";
import { applyBands, computePit } from "./pit";
import { computePayroll } from "./payroll";
import { computeCompanyTax, computeVat } from "./company";
import { scoreReadiness } from "./readiness";
import { buildDeadlines } from "./calendar";

describe("PIT bands (Nigeria Tax Act 2025)", () => {
  it("charges nothing on the first ₦800k", () => {
    expect(applyBands(800_000).tax).toBe(0);
  });
  it("applies progressive bands", () => {
    // 2.2m @15% + 9m @18% + 1m @21% = 330k + 1.62m + 210k
    expect(applyBands(13_000_000).tax).toBe(2_160_000);
  });
  it("applies 25% above ₦50m", () => {
    const below = applyBands(50_000_000).tax;
    expect(applyBands(51_000_000).tax - below).toBe(250_000);
  });
});

describe("computePit", () => {
  it("deducts pension and caps rent relief at ₦500k", () => {
    const r = computePit({ basic: 6_000_000, housing: 2_400_000, transport: 1_200_000, otherAllowances: 0, annualRent: 5_000_000 });
    expect(r.pension).toBe(768_000);
    expect(r.rentRelief).toBe(500_000);
    expect(r.chargeable).toBe(9_600_000 - 768_000 - 500_000);
    expect(r.annualTax).toBeGreaterThan(0);
  });
  it("exempts minimum-wage earners", () => {
    const r = computePit({ basic: 840_000, housing: 0, transport: 0, otherAllowances: 0, annualRent: 0, pension: false });
    expect(r.exemptMinimumWage).toBe(true);
    expect(r.annualTax).toBe(0);
  });
});

describe("payroll", () => {
  it("applies NSITF always, ITF and pension by thresholds", () => {
    const small = computePayroll({ employees: 2, basic: 100_000, housing: 0, transport: 0, otherAllowances: 0, annualRent: 0, annualTurnover: 10_000_000, nhf: false });
    expect(small.pensionApplies).toBe(false);
    expect(small.itfApplies).toBe(false);
    expect(small.perEmployee.nsitf).toBe(1_000);

    const big = computePayroll({ employees: 10, basic: 200_000, housing: 50_000, transport: 50_000, otherAllowances: 0, annualRent: 0, annualTurnover: 0, nhf: true });
    expect(big.itfApplies).toBe(true);
    expect(big.perEmployee.employerPension).toBe(30_000);
    expect(big.annual.itf).toBe(300_000 * 10 * 12 * 0.01);
    expect(big.perEmployee.nhf).toBe(5_000);
  });
});

describe("company tax", () => {
  it("small company pays nothing", () => {
    const r = computeCompanyTax({ turnover: 40_000_000, fixedAssets: 10_000_000, profit: 8_000_000, professionalServices: false, partOfMultinational: false });
    expect(r.isSmall).toBe(true);
    expect(r.total).toBe(0);
  });
  it("professional services are excluded from small status", () => {
    const r = computeCompanyTax({ turnover: 40_000_000, fixedAssets: 10_000_000, profit: 10_000_000, professionalServices: true, partOfMultinational: false });
    expect(r.isSmall).toBe(false);
    expect(r.cit).toBe(3_000_000);
    expect(r.developmentLevy).toBe(400_000);
  });
  it("flags minimum ETR at ₦20bn", () => {
    expect(computeCompanyTax({ turnover: 20_000_000_000, fixedAssets: 0, profit: 1, professionalServices: false, partOfMultinational: false }).minimumEtrApplies).toBe(true);
  });
  it("VAT add/extract round-trips", () => {
    expect(computeVat(1_000_000, "add").gross).toBe(1_075_000);
    expect(computeVat(1_075_000, "extract").net).toBe(1_000_000);
  });
});

describe("readiness", () => {
  it("scores 100 when all yes", () => {
    const profile = { employees: 10, turnoverBand: "100m-1b" as const, bidsForGovernment: true, sector: "" };
    const all = Object.fromEntries(["cac", "tin", "cit", "vat", "wht", "paye", "pension", "nsitf", "itf", "tcc", "bpp", "books"].map((k) => [k, "yes" as const]));
    const r = scoreReadiness(profile, all);
    expect(r.score).toBe(100);
    expect(r.gaps).toHaveLength(0);
  });
  it("skips BPP when not bidding and marks gaps hot for contractors", () => {
    const r = scoreReadiness({ employees: 30, turnoverBand: "1b-20b", bidsForGovernment: true, sector: "" }, { cac: "no", tcc: "no", bpp: "no" });
    expect(r.priority).toBe("hot");
    const r2 = scoreReadiness({ employees: 0, turnoverBand: "under-25m", bidsForGovernment: false, sector: "" }, {});
    expect(r2.applicable).toBe(6);
  });
});

describe("calendar", () => {
  it("produces monthly PAYE/VAT and annual ITF/CIT dates", () => {
    const list = buildDeadlines({ from: new Date("2026-11-14T00:00:00Z"), months: 12, obligations: ["paye", "vat", "itf", "cit", "paye-annual"], fyeMonth: 11 });
    const dates = list.map((d) => `${d.obligation}:${d.date}`);
    expect(dates).toContain("paye:2026-12-10");
    expect(dates).toContain("vat:2026-11-21");
    expect(dates).toContain("paye-annual:2027-01-31");
    expect(dates).toContain("itf:2027-04-01");
    expect(dates).toContain("cit:2027-06-30");
    expect(list.every((d) => d.date >= "2026-11-14")).toBe(true);
  });
});
