import type { Metadata } from "next";
import { PayrollCalculator } from "@/components/tools/PayrollCalculator";
import { Disclaimer, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Payroll Cost Calculator: Pension, NSITF, ITF, NHF & PAYE",
  description: "Work out the true cost of your staff in Nigeria: PAYE, 18% pension, NSITF 1%, ITF 1% and NHF 2.5%, with monthly remittance amounts.",
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Calculator · Payroll levies"
        title="Payroll cost: PAYE, pension, NSITF & ITF"
        intro="See what each employee really costs, and exactly what you owe FCT-IRS, your staff's PFAs, NSITF and ITF."
      />
      <div className="container-x space-y-8 py-12">
        <PayrollCalculator />
        <Disclaimer />
      </div>
    </>
  );
}
