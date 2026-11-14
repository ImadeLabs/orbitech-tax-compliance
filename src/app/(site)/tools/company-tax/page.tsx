import type { Metadata } from "next";
import { CompanyTaxCalculator } from "@/components/tools/CompanyTaxCalculator";
import { Disclaimer, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Company Income Tax & Development Levy Calculator",
  description: "Check whether you qualify as a small company (0% CIT) and estimate 30% CIT plus the 4% development levy under the Nigeria Tax Act 2025.",
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Calculator · Companies"
        title="CIT & development levy estimator"
        intro="Find out whether you qualify for 0% CIT as a small company, and estimate your FY2026 tax for the returns due in 2027."
      />
      <div className="container-x space-y-8 py-12">
        <CompanyTaxCalculator />
        <Disclaimer />
      </div>
    </>
  );
}
