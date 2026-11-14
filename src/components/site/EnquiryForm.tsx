"use client";

import { useActionState, useEffect, useRef } from "react";
import { CircleAlert, MessageCircle, BadgeCheck } from "lucide-react";
import { submitEnquiry, type FormState } from "@/app/(site)/actions";
import { SERVICE_OPTIONS } from "@/lib/services";
import { ABUJA_AREAS, SECTORS, whatsappLink } from "@/lib/site";
import { TURNOVER_BANDS } from "@/lib/tax/readiness";

const initial: FormState = { ok: false };

export function EnquiryForm({
  defaultServices = [],
  compact = false,
  source = "contact",
  messagePlaceholder = "Tell us what you need, e.g. \"We have a federal tender closing in 3 weeks and need our ITF and NSITF certificates.\"",
}: {
  defaultServices?: string[];
  compact?: boolean;
  source?: "contact" | "callback" | "tool";
  messagePlaceholder?: string;
}) {
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const tRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (tRef.current) tRef.current.value = String(Date.now());
  }, []);

  if (state.ok) {
    return (
      <div className="card p-6 text-center sm:p-8" role="status">
        <BadgeCheck className="mx-auto text-emerald-600" size={44} />
        <h3 className="mt-3 text-xl font-bold text-navy-950">Thank you, we&apos;ve received your enquiry</h3>
        {state.ref && state.ref !== "RECEIVED" && (
          <p className="mt-2 text-slate-600">
            Your reference is <span className="font-mono font-semibold text-navy-900">{state.ref}</span>. A consultant will contact you within one business day.
          </p>
        )}
        <a
          href={whatsappLink(`Hello Orbitech, I just sent an enquiry on your website${state.ref && state.ref !== "RECEIVED" ? ` (ref ${state.ref})` : ""}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn mt-5 bg-[#25D366] text-white hover:brightness-95"
        >
          <MessageCircle size={18} /> Need it sooner? Message us on WhatsApp
        </a>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};
  const err = (k: string) =>
    fe[k] ? (
      <p className="mt-1 text-xs text-red-600" id={`${k}-err`}>
        {fe[k]}
      </p>
    ) : null;

  return (
    <form action={action} className="card space-y-4 p-5 sm:p-7" noValidate>
      <input type="hidden" name="source" value={source} />
      <input ref={tRef} type="hidden" name="_t" defaultValue="0" />
      <div className="hidden" aria-hidden="true">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.error && (
        <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          <CircleAlert size={18} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Full name *</label>
          <input id="name" name="name" className="input" autoComplete="name" required aria-invalid={!!fe.name} aria-describedby={fe.name ? "name-err" : undefined} />
          {err("name")}
        </div>
        <div>
          <label className="label" htmlFor="company">Company</label>
          <input id="company" name="company" className="input" autoComplete="organization" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone / WhatsApp *</label>
          <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" placeholder="0803 000 0000" required aria-invalid={!!fe.phone} aria-describedby={fe.phone ? "phone-err" : undefined} />
          {err("phone")}
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" aria-invalid={!!fe.email} aria-describedby={fe.email ? "email-err" : undefined} />
          {err("email")}
        </div>
      </div>

      <fieldset>
        <legend className="label">What do you need help with?</legend>
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((s) => (
            <label key={s.value} className="cursor-pointer">
              <input type="checkbox" name="services" value={s.value} defaultChecked={defaultServices.includes(s.value)} className="peer sr-only" />
              <span className="inline-block rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition peer-checked:border-navy-700 peer-checked:bg-navy-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400 hover:border-navy-400">
                {s.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="location">Business location</label>
            <select id="location" name="location" className="input" defaultValue="">
              <option value="">Select area</option>
              {ABUJA_AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sector">Sector</label>
            <select id="sector" name="sector" className="input" defaultValue="">
              <option value="">Select sector</option>
              {SECTORS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="employees">Number of staff</label>
            <input id="employees" name="employees" type="number" min={0} inputMode="numeric" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="turnoverBand">Annual turnover</label>
            <select id="turnoverBand" name="turnoverBand" className="input" defaultValue="">
              <option value="">Prefer not to say</option>
              {TURNOVER_BANDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="label" htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={compact ? 3 : 4} className="input" placeholder={messagePlaceholder} />
      </div>

      <fieldset>
        <legend className="label">How should we contact you?</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-700">
          {["WhatsApp", "Phone call", "Email", "Office visit"].map((p, i) => (
            <label key={p} className="flex items-center gap-2">
              <input type="radio" name="preferredContact" value={p} defaultChecked={i === 0} className="accent-navy-800" /> {p}
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="btn-navy w-full py-3.5 text-base" disabled={pending}>
        {pending ? "Sending…" : "Request a free consultation"}
      </button>
      <p className="text-center text-xs text-slate-500">We reply within one business day. Your details are kept confidential.</p>
    </form>
  );
}
