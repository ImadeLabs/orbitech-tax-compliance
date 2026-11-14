import type { Metadata } from "next";
import { PayeCalculator } from "@/components/tools/PayeCalculator";
import { Disclaimer, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "PAYE Calculator 2026: New Nigeria Tax Act Bands",
  description: "Calculate PAYE and net pay on the 2026 personal income tax bands (0%–25%) with rent relief, pension and NHF.",
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Calculator · Nigeria Tax Act 2025"
        title="PAYE calculator (2026 bands)"
        intro="The first ₦800,000 is tax-free, the CRA is replaced by rent relief, and rates run from 15% to 25%. See your PAYE and take-home pay under the new rules."
      />
      <div className="container-x space-y-8 py-12">
        <PayeCalculator />
        <Disclaimer />
      </div>
    </>
  );
}
