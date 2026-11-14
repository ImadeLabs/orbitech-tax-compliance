import type { Metadata } from "next";
import { VatCalculator } from "@/components/tools/VatCalculator";
import { PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "VAT Calculator Nigeria (7.5%)",
  description: "Add or remove 7.5% Nigerian VAT on any amount.",
};

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Calculator · VAT" title="VAT calculator (7.5%)" />
      <div className="container-x py-12">
        <VatCalculator />
      </div>
    </>
  );
}
