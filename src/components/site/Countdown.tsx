"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 60 * 60 * 1000);
  return () => clearInterval(t);
};

/** Days until an ISO date (Lagos). Renders nothing on the server to avoid stale/hydration-mismatched numbers. */
export function DaysUntil({ date }: { date: string }) {
  const today = useSyncExternalStore(
    subscribe,
    () => new Date(Date.now() + 3600_000).toISOString().slice(0, 10),
    () => "",
  );
  if (!today) return <span className="opacity-0">–</span>;
  const days = Math.round((Date.parse(date) - Date.parse(today)) / 86400_000);
  if (days < 0) return <span>passed</span>;
  if (days === 0) return <span>today</span>;
  return <span>{days} days</span>;
}
