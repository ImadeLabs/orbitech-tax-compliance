const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const ngn2 = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const naira = (n: number) => ngn.format(Math.round(n || 0));
export const naira2 = (n: number) => ngn2.format(n || 0);
export const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;

/** Parses "1,200,000" / "₦1.2m" / "500k" style inputs. */
export function parseAmount(v: string): number {
  if (!v) return 0;
  const s = v.toLowerCase().replace(/[₦,\s]/g, "");
  const m = s.match(/^(\d*\.?\d+)([kmb]|bn)?$/);
  if (!m) return Number(s.replace(/[^\d.]/g, "")) || 0;
  const n = parseFloat(m[1]);
  const mult = m[2] === "k" ? 1e3 : m[2] === "m" ? 1e6 : m[2] === "b" || m[2] === "bn" ? 1e9 : 1;
  return n * mult;
}

export function formatDate(d: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(d).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", ...opts });
}

export function formatDateTime(d: string | Date) {
  return new Date(d).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(d: string | Date, now = Date.now()) {
  const s = Math.round((now - new Date(d).getTime()) / 1000);
  const abs = Math.abs(s);
  const suffix = s >= 0 ? "ago" : "from now";
  if (abs < 60) return s >= 0 ? "just now" : "in a moment";
  if (abs < 3600) return `${Math.round(abs / 60)}m ${suffix}`;
  if (abs < 86400) return `${Math.round(abs / 3600)}h ${suffix}`;
  return `${Math.round(abs / 86400)}d ${suffix}`;
}
