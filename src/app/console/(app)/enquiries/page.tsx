import Link from "next/link";
import { connection } from "next/server";
import { Download, Search } from "lucide-react";
import { getStore, STATUSES, STATUS_LABEL, type EnquiryFilter, type Priority } from "@/lib/store";
import { SERVICE_OPTIONS } from "@/lib/services";
import { EnquiryTable } from "@/components/console/bits";

export const metadata = { title: "Enquiries" };

type SP = { status?: string; q?: string; priority?: string; service?: string };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  await connection();
  const sp = await searchParams;
  const status = (sp.status && ([...STATUSES, "open", "all"] as string[]).includes(sp.status) ? sp.status : "open") as EnquiryFilter["status"];
  const priority = (["hot", "warm", "cold"].includes(sp.priority ?? "") ? sp.priority : undefined) as Priority | undefined;
  const filter: EnquiryFilter = { status, q: sp.q?.trim() || undefined, priority, service: sp.service || undefined, limit: 500 };
  const rows = await getStore().listEnquiries(filter);
  const qs = (patch: Partial<SP>) => {
    const p = new URLSearchParams();
    const merged = { status, q: sp.q, priority: sp.priority, service: sp.service, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `?${p.toString()}`;
  };
  const exportQs = new URLSearchParams(Object.entries({ status: status ?? "", q: sp.q ?? "", priority: sp.priority ?? "", service: sp.service ?? "" }).filter(([, v]) => v)).toString();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy-950">Enquiries</h1>
        <a href={`/console/export?${exportQs}`} className="btn-outline py-2">
          <Download size={16} /> Export CSV
        </a>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 text-sm">
        {(["open", ...STATUSES, "all"] as const).map((st) => (
          <Link key={st} href={qs({ status: st })} className={`-mb-px border-b-2 px-3 py-2 font-medium whitespace-nowrap ${status === st ? "border-navy-900 text-navy-900" : "border-transparent text-slate-500 hover:text-navy-900"}`}>
            {st === "open" ? "Open" : st === "all" ? "All" : STATUS_LABEL[st]}
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap gap-3" role="search">
        <input type="hidden" name="status" value={status} />
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={sp.q} placeholder="Search name, company, phone, ref…" className="input pl-9" />
        </div>
        <select name="priority" defaultValue={sp.priority ?? ""} className="input w-auto">
          <option value="">Any priority</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
        <select name="service" defaultValue={sp.service ?? ""} className="input w-auto max-w-60">
          <option value="">Any service</option>
          {SERVICE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button className="btn-navy py-2">Filter</button>
      </form>

      <p className="text-sm text-slate-500">{rows.length} result{rows.length === 1 ? "" : "s"}</p>
      <EnquiryTable rows={rows} now={new Date().getTime()} />
    </div>
  );
}
