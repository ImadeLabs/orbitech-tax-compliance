"use client";

import { useState } from "react";
import Link from "next/link";
import { computeVat } from "@/lib/tax/company";
import { naira2, parseAmount } from "@/lib/format";
import { MoneyField, Row, useToolUsage } from "./fields";

export function VatCalculator() {
  const [mode, setMode] = useState<"add" | "extract">("add");
  const [amount, setAmount] = useState("1,000,000");
  const r = computeVat(parseAmount(amount), mode);
  useToolUsage("vat", parseAmount(amount) > 0);

  return (
    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
      <div className="card space-y-5 p-6">
        <div className="flex rounded-lg bg-slate-100 p-1 text-sm font-medium" role="tablist" aria-label="VAT mode">
          {[
            ["add", "Add VAT"],
            ["extract", "Remove VAT"],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={mode === v}
              onClick={() => setMode(v as "add" | "extract")}
              className={`flex-1 rounded-md py-2 transition ${mode === v ? "bg-white text-navy-900 shadow-sm" : "text-slate-500"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <MoneyField id="amount" label={mode === "add" ? "Amount before VAT" : "Amount including VAT"} value={amount} onChange={setAmount} />
      </div>
      <div className="space-y-5">
        <div className="card divide-y divide-slate-100 px-5 py-2">
          <Row label="Net amount" value={naira2(r.net)} />
          <Row label="VAT (7.5%)" value={naira2(r.vat)} />
          <Row label="Gross amount" value={naira2(r.gross)} strong />
        </div>
        <p className="text-sm text-slate-600">
          File your VAT return by the 21st of the following month, and file a nil return in months with no sales. Under the 2025 Acts, input VAT on assets and services can now be recovered.
        </p>
        <Link href="/services/vat-compliance#enquire" className="text-sm font-semibold text-navy-700 hover:underline">
          Let us handle your monthly VAT →
        </Link>
      </div>
    </div>
  );
}
