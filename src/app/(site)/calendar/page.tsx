import type { Metadata } from "next";
import { DeadlineCalendar } from "@/components/tools/DeadlineCalendar";
import { CtaBand, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Nigeria Tax & Compliance Deadline Calendar",
  description: "Your filing dates for PAYE, VAT, WHT, pension, NSITF, ITF, CIT, annual returns and TCC, with a downloadable calendar.",
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Compliance calendar"
        title="Never miss a filing deadline"
        intro="Choose the obligations that apply to you and your financial year end. Then download every deadline to Google Calendar or Outlook, with reminders."
      />
      <div className="container-x py-12">
        <DeadlineCalendar />
      </div>
      <CtaBand title="Would you rather we handle the deadlines?" text="We file on time every month and send you evidence of every filing, so you can focus on running your business." />
    </>
  );
}
