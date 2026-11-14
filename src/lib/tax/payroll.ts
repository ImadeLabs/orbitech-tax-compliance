import { computePit, type PitResult } from "./pit";
import {
  ITF_MIN_EMPLOYEES,
  ITF_MIN_TURNOVER,
  ITF_RATE,
  NHF_RATE,
  NSITF_RATE,
  PENSION_EMPLOYER_RATE,
  PENSION_MIN_EMPLOYEES,
} from "./rules";

export type PayrollInput = {
  employees: number;
  /** Average MONTHLY figures per employee. */
  basic: number;
  housing: number;
  transport: number;
  otherAllowances: number;
  /** Average annual rent paid per employee (for rent relief), optional. */
  annualRent: number;
  annualTurnover: number;
  nhf: boolean;
};

export type PayrollResult = {
  employees: number;
  pensionApplies: boolean;
  itfApplies: boolean;
  perEmployee: {
    grossMonthly: number;
    employeePension: number;
    nhf: number;
    paye: number;
    netMonthly: number;
    employerPension: number;
    nsitf: number;
    itf: number;
    employerCostMonthly: number;
  };
  monthly: {
    grossPayroll: number;
    paye: number;
    employeePension: number;
    employerPension: number;
    nhf: number;
    nsitf: number;
    itfAccrual: number;
    totalRemittances: number;
    employerCost: number;
  };
  annual: {
    grossPayroll: number;
    itf: number;
    nsitf: number;
    employerPension: number;
    paye: number;
    employerCost: number;
  };
  pit: PitResult;
};

const r = (n: number) => Math.round(n * 100) / 100;
const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function computePayroll(input: PayrollInput): PayrollResult {
  const employees = Math.max(1, Math.floor(pos(input.employees)) || 1);
  const basic = pos(input.basic);
  const housing = pos(input.housing);
  const transport = pos(input.transport);
  const other = pos(input.otherAllowances);
  const grossMonthly = basic + housing + transport + other;
  const bht = basic + housing + transport;

  const pensionApplies = employees >= PENSION_MIN_EMPLOYEES;
  const itfApplies = employees >= ITF_MIN_EMPLOYEES || pos(input.annualTurnover) >= ITF_MIN_TURNOVER;

  const pit = computePit({
    basic: basic * 12,
    housing: housing * 12,
    transport: transport * 12,
    otherAllowances: other * 12,
    annualRent: pos(input.annualRent),
    pension: pensionApplies,
    nhf: input.nhf,
  });

  const employeePension = pensionApplies ? r(bht * 0.08) : 0;
  const nhf = input.nhf ? r(basic * NHF_RATE) : 0;
  const paye = pit.monthlyTax;
  const employerPension = pensionApplies ? r(bht * PENSION_EMPLOYER_RATE) : 0;
  const nsitf = r(grossMonthly * NSITF_RATE);
  const itf = itfApplies ? r(grossMonthly * ITF_RATE) : 0;
  const employerCostMonthly = r(grossMonthly + employerPension + nsitf + itf);

  const m = (n: number) => r(n * employees);
  const monthly = {
    grossPayroll: m(grossMonthly),
    paye: m(paye),
    employeePension: m(employeePension),
    employerPension: m(employerPension),
    nhf: m(nhf),
    nsitf: m(nsitf),
    itfAccrual: m(itf),
    totalRemittances: 0,
    employerCost: m(employerCostMonthly),
  };
  monthly.totalRemittances = r(
    monthly.paye + monthly.employeePension + monthly.employerPension + monthly.nhf + monthly.nsitf,
  );

  return {
    employees,
    pensionApplies,
    itfApplies,
    perEmployee: {
      grossMonthly,
      employeePension,
      nhf,
      paye,
      netMonthly: r(grossMonthly - employeePension - nhf - paye),
      employerPension,
      nsitf,
      itf,
      employerCostMonthly,
    },
    monthly,
    annual: {
      grossPayroll: r(monthly.grossPayroll * 12),
      itf: r(monthly.itfAccrual * 12),
      nsitf: r(monthly.nsitf * 12),
      employerPension: r(monthly.employerPension * 12),
      paye: r(monthly.paye * 12),
      employerCost: r(monthly.employerCost * 12),
    },
    pit,
  };
}
