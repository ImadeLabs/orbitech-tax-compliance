import type { Metadata } from "next";
import { ReadinessCheck } from "@/components/tools/ReadinessCheck";
import { Disclaimer, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Free Tax Year 2027 Readiness Check",
  description: "Score your business against Nigeria's 2026 tax laws in 3 minutes: CIT, VAT, PAYE, PenCom, NSITF, ITF, TCC and BPP. Get an instant action plan.",
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Free · 3 minutes · Instant result"
        title="Are you ready for Tax Year 2027?"
        intro="Answer a few questions about your filings, payroll levies and certificates. You get a readiness score and a prioritised action plan straight away."
      />
      <div className="container-x space-y-8 py-12">
        <ReadinessCheck />
        <Disclaimer />
      </div>
    </>
  );
}
