import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, CircleAlert, Mail, MessageCircle, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getStore, STATUSES, STATUS_LABEL } from "@/lib/store";
import { logActivity, updateEnquiry } from "@/app/console/actions";
import { formatDateTime, timeAgo } from "@/lib/format";
import { serviceTitle } from "@/lib/services";
import { channelOf } from "@/lib/analytics";
import { followUpTemplates, intlPhone } from "@/lib/templates";
import { QUESTIONS, TURNOVER_BANDS } from "@/lib/tax/readiness";
import { FollowUpChip, PriorityBadge, StatusBadge } from "@/components/console/bits";
import { Templates } from "@/components/console/Templates";

const ACTIVITY_ICON: Record<string, string> = { call: "📞", whatsapp: "💬", email: "✉️", meeting: "🤝", note: "📝", status: "🔄", system: "⚙️", followup: "⏰" };

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await requireAdmin();
  const { id } = await params;
  const store = getStore();
  const e = await store.getEnquiry(id);
  if (!e) notFound();
  const [activities, journey] = await Promise.all([store.listActivities(id), e.visitorId ? store.listVisits({ visitorId: e.visitorId, limit: 200 }) : Promise.resolve([])]);
  const now = new Date().getTime();
  const phone = intlPhone(e.phone);
  const readiness = e.readiness as { answers?: Record<string, string>; gaps?: string[] } | null;
  const firstVisit = journey.at(-1);

  const detail: [string, string][] = [
    ["Phone", e.phone],
    ["Email", e.email],
    ["Location", e.location],
    ["Sector", e.sector],
    ["Staff", e.employees == null ? "" : String(e.employees)],
    ["Turnover", TURNOVER_BANDS.find((b) => b.value === e.turnoverBand)?.label ?? ""],
    ["Prefers", e.preferredContact],
    ["Source", `${e.source} form`],
    ["Came from", firstVisit ? channelOf(firstVisit) : channelOf({ referrer: e.referrer, utmSource: e.utmSource, utmMedium: e.utmMedium })],
    ["Landing page", e.landingPath],
    ["Campaign", e.utmCampaign],
  ];

  return (
    <div className="space-y-6">
      <Link href="/console/enquiries" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900">
        <ArrowLeft size={14} /> Enquiries
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-950">{e.name}</h1>
            <StatusBadge status={e.status} />
            <PriorityBadge priority={e.priority} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {e.company && <>{e.company} · </>}
            <span className="font-mono">{e.ref}</span> · received {formatDateTime(e.createdAt)} ({timeAgo(e.createdAt, now)})
          </p>
          <p className="mt-1">
            <FollowUpChip at={e.status === "won" || e.status === "lost" ? null : e.nextFollowUpAt} now={now} />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {phone && (
            <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] px-4 py-2 text-white">
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
          {phone && (
            <a href={`tel:+${phone}`} className="btn-outline px-4 py-2">
              <Phone size={16} /> Call
            </a>
          )}
          {e.email && (
            <a href={`mailto:${e.email}`} className="btn-outline px-4 py-2">
              <Mail size={16} /> Email
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="card p-5">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {detail
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="w-24 shrink-0 text-slate-500">{k}</dt>
                    <dd className="min-w-0 break-words text-slate-800">{v}</dd>
                  </div>
                ))}
            </dl>
            {e.services.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
                {e.services.map((s) => (
                  <span key={s} className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-800">
                    {serviceTitle(s)}
                  </span>
                ))}
              </div>
            )}
            {e.message && <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm whitespace-pre-wrap text-slate-700">{e.message}</p>}
          </div>

          {readiness?.answers && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-navy-950">Readiness check: {e.score}/100</p>
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {QUESTIONS.filter((q) => readiness.answers?.[q.id]).map((q) => {
                  const a = readiness.answers![q.id];
                  return (
                    <li key={q.id} className="flex items-start justify-between gap-4 py-2">
                      <span className="text-slate-700">{q.text}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${a === "yes" ? "bg-emerald-50 text-emerald-700" : a === "no" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                        {a === "unsure" ? "Not sure" : a}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div id="log" className="card scroll-mt-6 p-5">
            <p className="text-sm font-semibold text-navy-950">Log contact / add note</p>
            <form key={`l-${e.updatedAt}-${activities.length}`} action={logActivity} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={e.id} />
              <div className="flex flex-wrap gap-2">
                {[
                  ["call", "📞 Call"],
                  ["whatsapp", "💬 WhatsApp"],
                  ["email", "✉️ Email"],
                  ["meeting", "🤝 Meeting"],
                  ["note", "📝 Note only"],
                ].map(([v, l], i) => (
                  <label key={v} className="cursor-pointer">
                    <input type="radio" name="type" value={v} defaultChecked={i === 0} className="peer sr-only" />
                    <span className="inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-sm peer-checked:border-navy-800 peer-checked:bg-navy-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400">{l}</span>
                  </label>
                ))}
              </div>
              <textarea name="body" rows={3} className="input" placeholder="What happened? e.g. Spoke to MD, needs ITF + NSITF before 12 Dec tender. Sending docs list." />
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="label" htmlFor="followUp">Next follow-up</label>
                  <select id="followUp" name="followUp" className="input w-auto" defaultValue="3d">
                    <option value="keep">Keep current</option>
                    <option value="2h">In 2 hours</option>
                    <option value="1d">Tomorrow</option>
                    <option value="3d">In 3 days</option>
                    <option value="1w">In 1 week</option>
                    <option value="2w">In 2 weeks</option>
                    <option value="1m">In 1 month</option>
                    <option value="none">No follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="followUpAt">…or exact time</label>
                  <input id="followUpAt" type="datetime-local" className="input w-auto" name="followUpExact" />
                </div>
                <button className="btn-navy">Save</button>
              </div>
            </form>
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold text-navy-950">Timeline</p>
            <ol className="mt-4 space-y-4">
              {activities.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span aria-hidden className="mt-0.5 text-base">{ACTIVITY_ICON[a.type] ?? "•"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm whitespace-pre-wrap text-slate-800">{a.body}</p>
                    <p className="text-xs text-slate-400">
                      {a.author} · {formatDateTime(a.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
              {!activities.length && <li className="text-sm text-slate-400">No activity yet.</li>}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <p className="text-sm font-semibold text-navy-950">Stage & ownership</p>
            <form key={`u-${e.updatedAt}`} action={updateEnquiry} className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <input type="hidden" name="id" value={e.id} />
              <div>
                <label className="label" htmlFor="status">Status</label>
                <select id="status" name="status" className="input" defaultValue={e.status}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="priority">Priority</label>
                <select id="priority" name="priority" className="input" defaultValue={e.priority}>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="assignedTo">Owner</label>
                <input id="assignedTo" name="assignedTo" className="input" defaultValue={e.assignedTo || ""} placeholder={session.user} />
              </div>
              <div>
                <label className="label" htmlFor="estimatedValue">Est. fee (₦)</label>
                <input id="estimatedValue" name="estimatedValue" inputMode="numeric" className="input" defaultValue={e.estimatedValue ?? ""} />
              </div>
              <div className="sm:col-span-2 xl:col-span-1 2xl:col-span-2">
                <label className="label" htmlFor="reason">Reason / note (optional)</label>
                <input id="reason" name="reason" className="input" placeholder="e.g. Signed engagement letter / went with another firm" />
              </div>
              <button className="btn-navy sm:col-span-2 xl:col-span-1 2xl:col-span-2">Update</button>
            </form>
          </div>

          <Templates templates={followUpTemplates(e, session.user)} phone={phone} email={e.email} />

          <div className="card p-5">
            <p className="text-sm font-semibold text-navy-950">Visitor journey</p>
            {journey.length === 0 ? (
              <p className="mt-3 flex items-start gap-2 text-sm text-slate-400">
                <CircleAlert size={16} className="mt-0.5 shrink-0" /> No tracked visits linked to this enquiry.
              </p>
            ) : (
              <ol className="mt-3 max-h-96 space-y-2 overflow-y-auto text-sm">
                {journey.map((v) => (
                  <li key={v.id} className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-slate-700">{v.kind === "event" ? <em className="text-gold-700">{v.name}</em> : v.path}</span>
                    <span className="shrink-0 text-xs text-slate-400">{formatDateTime(v.ts)}</span>
                  </li>
                ))}
              </ol>
            )}
            {firstVisit && (
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                First seen {formatDateTime(firstVisit.ts)} via {channelOf(firstVisit)} · {firstVisit.device} · {[firstVisit.city, firstVisit.country].filter(Boolean).join(", ") || "location unknown"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
