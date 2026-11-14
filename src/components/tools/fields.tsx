"use client";

import { useEffect, useRef } from "react";
import { naira, parseAmount } from "@/lib/format";
import { track } from "@/components/site/Tracker";

export function MoneyField({
  id,
  label,
  value,
  onChange,
  hint,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  suffix?: string;
}) {
  const parsed = parseAmount(value);
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">₦</span>
        <input
          id={id}
          inputMode="decimal"
          className="input pl-8"
          value={value}
          placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={`${id}-hint`}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs text-slate-400">{suffix}</span>}
      </div>
      <p id={`${id}-hint`} className="mt-1 min-h-4 text-xs text-slate-500">
        {value && /[kmb]/i.test(value) ? `= ${naira(parsed)}` : hint}
      </p>
    </div>
  );
}

export function Toggle({ id, label, checked, onChange, hint }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input id={id} type="checkbox" className="mt-1 size-4 accent-navy-800" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

export function Row({ label, value, strong, muted, negative }: { label: string; value: string; strong?: boolean; muted?: boolean; negative?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2.5 ${strong ? "font-semibold text-navy-950" : muted ? "text-slate-500" : "text-slate-700"}`}>
      <span className="text-sm">{label}</span>
      <span className={`font-mono text-sm tabular-nums ${negative ? "text-red-600" : ""}`}>{value}</span>
    </div>
  );
}

/** Fires one analytics event the first time the user produces a non-zero result. */
export function useToolUsage(name: string, active: boolean) {
  const sent = useRef(false);
  useEffect(() => {
    if (!active || sent.current) return;
    const t = setTimeout(() => {
      sent.current = true;
      track(`tool:${name}`);
    }, 1500);
    return () => clearTimeout(t);
  }, [active, name]);
}
