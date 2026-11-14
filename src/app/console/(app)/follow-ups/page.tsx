import Link from "next/link";
import { connection } from "next/server";
import { MessageCircle, Phone } from "lucide-react";
import { getStore, type Enquiry } from "@/lib/store";
import { snooze } from "@/app/console/actions";
import { formatDateTime, timeAgo } from "@/lib/format";
import { serviceTitle } from "@/lib/services";
import { intlPhone } from "@/lib/templates";
import { PriorityBadge, StatusBadge } from "@/components/console/bits";

export const metadata = { title: "Follow-ups" };

function Bucket({ title, tone, rows, now }: { title: string; tone: string; rows: Enquiry[]; now: number }) {
  return (
    <section>
      <h2 className={`mb-3 flex items-center gap-2 text-sm font-bold tracking-wide uppercase ${tone}`}>
        {title} <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">{rows.length}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="card p-5 text-sm text-slate-400">Nothing here.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((e) => (
            <li key={e.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <Link href={`/console/enquiries/${e.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-navy-950">{e.name}</span>
                  {e.company && <span className="text-sm text-slate-500">· {e.company}</span>}
                  <StatusBadge status={e.status} />
                  <PriorityBadge priority={e.priority} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {e.services.map(serviceTitle).join(", ") || e.message.slice(0, 90)} · received {timeAgo(e.createdAt, now)}
                  {e.lastContactedAt ? ` · last contact ${timeAgo(e.lastContactedAt, now)}` : " · never contacted"}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600">Due {e.nextFollowUpAt ? formatDateTime(e.nextFollowUpAt) : "—"}</p>
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <a href={`https://wa.me/${intlPhone(e.phone)}`} target="_blank" rel="noopener noreferrer" className="btn border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800" aria-label={`WhatsApp ${e.name}`}>
                  <MessageCircle size={16} />
                </a>
                <a href={`tel:+${intlPhone(e.phone)}`} className="btn-outline px-3 py-2" aria-label={`Call ${e.name}`}>
                  <Phone size={16} />
                </a>
                <form action={snooze} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={e.id} />
                  <select name="followUp" className="input w-auto py-2 text-sm" defaultValue="1d" aria-label="Snooze until">
                    <option value="2h">+2 hours</option>
                    <option value="1d">Tomorrow</option>
                    <option value="3d">+3 days</option>
                    <option value="1w">+1 week</option>
                    <option value="2w">+2 weeks</option>
                    <option value="none">Clear</option>
                  </select>
                  <button className="btn-outline px-3 py-2">Snooze</button>
                </form>
                <Link href={`/console/enquiries/${e.id}#log`} className="btn-navy px-3 py-2">
                  Log contact
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function FollowUpsPage() {
  await connection();
  const now = new Date();
  const t = now.getTime();
  const endOfToday = new Date(now);
  endOfToday.setUTCHours(22, 59, 59, 999); // 23:59 Lagos
  if (endOfToday.getTime() < t) endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);

  const open = await getStore().listEnquiries({ status: "open", limit: 2000 });
  const scheduled = open.filter((e) => e.nextFollowUpAt).sort((a, b) => a.nextFollowUpAt!.localeCompare(b.nextFollowUpAt!));
  const overdue = scheduled.filter((e) => new Date(e.nextFollowUpAt!).getTime() <= t);
  const today = scheduled.filter((e) => {
    const x = new Date(e.nextFollowUpAt!).getTime();
    return x > t && x <= endOfToday.getTime();
  });
  const upcoming = scheduled.filter((e) => new Date(e.nextFollowUpAt!).getTime() > endOfToday.getTime()).slice(0, 50);
  const unscheduled = open.filter((e) => !e.nextFollowUpAt);
  const rank = (e: Enquiry) => (e.priority === "hot" ? 0 : e.priority === "warm" ? 1 : 2);
  overdue.sort((a, b) => rank(a) - rank(b) || a.nextFollowUpAt!.localeCompare(b.nextFollowUpAt!));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Follow-ups</h1>
        <p className="text-sm text-slate-500">Work top to bottom. Hot leads come first. Logging a call or WhatsApp moves the lead to &ldquo;Contacted&rdquo; and lets you book the next follow-up.</p>
      </div>
      <Bucket title="Overdue" tone="text-red-600" rows={overdue} now={t} />
      <Bucket title="Later today" tone="text-amber-700" rows={today} now={t} />
      <Bucket title="Upcoming" tone="text-slate-600" rows={upcoming} now={t} />
      {unscheduled.length > 0 && <Bucket title="Open, no follow-up booked" tone="text-slate-500" rows={unscheduled} now={t} />}
    </div>
  );
}
