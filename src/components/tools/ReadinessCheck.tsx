"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, CircleAlert, MessageCircle } from "lucide-react";
import { submitReadiness, type FormState } from "@/app/(site)/actions";
import { applicableQuestions, scoreReadiness, TURNOVER_BANDS, type Answer, type Profile, type TurnoverBand } from "@/lib/tax/readiness";
import { SERVICE_BY_SLUG } from "@/lib/services";
import { ABUJA_AREAS, SECTORS, whatsappLink } from "@/lib/site";
import { track } from "@/components/site/Tracker";

const GRADE_STYLE: Record<string, string> = {
  Ready: "text-emerald-600",
  "Nearly ready": "text-lime-600",
  "At risk": "text-amber-600",
  "High risk": "text-red-600",
};

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = score >= 85 ? "#059669" : score >= 65 ? "#65a30d" : score >= 40 ? "#d97706" : "#dc2626";
  return (
    <svg viewBox="0 0 120 120" className="size-36" role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 60 60)" />
      <text x="60" y="58" textAnchor="middle" className="fill-navy-950 text-[30px] font-bold">{score}</text>
      <text x="60" y="78" textAnchor="middle" className="fill-slate-500 text-[11px]">out of 100</text>
    </svg>
  );
}

export function ReadinessCheck() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [profile, setProfile] = useState<Profile>({ employees: 10, turnoverBand: "50m-100m", bidsForGovernment: false, sector: "" });
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [state, action, pending] = useActionState(submitReadiness, { ok: false } as FormState);
  const top = useRef<HTMLDivElement>(null);
  const tRef = useRef<HTMLInputElement>(null);

  const questions = applicableQuestions(profile);
  const answered = questions.filter((q) => answers[q.id]).length;
  const result = scoreReadiness(profile, answers);

  useEffect(() => {
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (step === 2) {
      track("readiness:scored");
      if (tRef.current) tRef.current.value = String(Date.now());
    }
  }, [step]);

  return (
    <div ref={top} className="scroll-mt-24">
      <ol className="mb-8 flex items-center gap-2 text-xs font-semibold sm:text-sm" aria-label="Progress">
        {["Your business", "Questions", "Your score"].map((l, i) => (
          <li key={l} className="flex flex-1 items-center gap-2">
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${i <= step ? "bg-navy-900 text-white" : "bg-slate-200 text-slate-500"}`}>{i + 1}</span>
            <span className={i <= step ? "text-navy-900" : "text-slate-400"}>{l}</span>
            {i < 2 && <span className="h-px flex-1 bg-slate-200" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="card space-y-6 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="emp">How many staff do you employ?</label>
              <input id="emp" type="number" min={0} className="input" value={profile.employees} onChange={(e) => setProfile({ ...profile, employees: Math.max(0, Number(e.target.value) || 0) })} />
            </div>
            <div>
              <label className="label" htmlFor="tb">Annual turnover</label>
              <select id="tb" className="input" value={profile.turnoverBand} onChange={(e) => setProfile({ ...profile, turnoverBand: e.target.value as TurnoverBand })}>
                {TURNOVER_BANDS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="sec">Sector</label>
              <select id="sec" className="input" value={profile.sector} onChange={(e) => setProfile({ ...profile, sector: e.target.value })}>
                <option value="">Select sector</option>
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <fieldset>
              <legend className="label">Do you bid for government contracts?</legend>
              <div className="flex gap-3">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    aria-pressed={profile.bidsForGovernment === v}
                    onClick={() => setProfile({ ...profile, bidsForGovernment: v })}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${profile.bidsForGovernment === v ? "border-navy-800 bg-navy-900 text-white" : "border-slate-300 text-slate-700 hover:border-navy-400"}`}
                  >
                    {v ? "Yes / planning to" : "No"}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="flex justify-end">
            <button type="button" className="btn-navy" onClick={() => setStep(1)}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <fieldset key={q.id} className="card p-5 sm:p-6">
              <legend className="sr-only">{q.text}</legend>
              <div className="flex gap-4">
                <span className="mt-0.5 text-sm font-semibold text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gold-600">{q.area}</p>
                  <p className="mt-1 font-semibold text-navy-950">{q.text}</p>
                  <p className="mt-1 text-sm text-slate-500">{q.help}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["yes", "no", "unsure"] as Answer[]).map((a) => (
                      <button
                        key={a}
                        type="button"
                        aria-pressed={answers[q.id] === a}
                        onClick={() => setAnswers({ ...answers, [q.id]: a })}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition ${
                          answers[q.id] === a
                            ? a === "yes"
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : a === "no"
                                ? "border-red-600 bg-red-600 text-white"
                                : "border-amber-500 bg-amber-500 text-white"
                            : "border-slate-300 text-slate-700 hover:border-navy-400"
                        }`}
                      >
                        {a === "unsure" ? "Not sure" : a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </fieldset>
          ))}
          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <button type="button" className="btn-outline" onClick={() => setStep(0)}>
              <ArrowLeft size={16} /> Back
            </button>
            <span className="text-sm text-slate-500">
              {answered}/{questions.length} answered
            </span>
            <button type="button" className="btn-navy" onClick={() => setStep(2)} disabled={answered < Math.ceil(questions.length / 2)}>
              See my score <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="card flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
              <ScoreRing score={result.score} />
              <div className="text-center sm:text-left">
                <p className={`text-2xl font-bold ${GRADE_STYLE[result.grade]}`}>{result.grade}</p>
                <p className="mt-2 text-slate-600">
                  {result.gaps.length === 0
                    ? "Great position. Keep your calendar tight and renew certificates on time."
                    : `We found ${result.gaps.length} gap${result.gaps.length > 1 ? "s" : ""} to close before your 2027 returns and renewals.`}
                </p>
                {result.isSmallCompanyCandidate && (
                  <p className="mt-2 text-sm text-emerald-700">Your turnover suggests you may qualify for 0% CIT as a small company. You still need to file.</p>
                )}
              </div>
            </div>

            {result.gaps.length > 0 && (
              <div className="card divide-y divide-slate-100">
                <p className="px-6 py-4 font-semibold text-navy-950">Your Tax Year 2027 action plan</p>
                {result.gaps.map((g) => (
                  <div key={g.id} className="flex gap-4 px-6 py-4">
                    <CircleAlert size={20} className={`mt-0.5 shrink-0 ${g.severity === "high" ? "text-red-500" : "text-amber-500"}`} />
                    <div>
                      <p className="text-sm text-slate-800">{g.action}</p>
                      <Link href={`/services/${g.service}`} className="mt-1 inline-block text-xs font-semibold text-navy-700 hover:underline">
                        {SERVICE_BY_SLUG[g.service]?.title} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button type="button" className="btn-outline" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Change answers
            </button>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            {state.ok ? (
              <div className="card p-6 text-center sm:p-8" role="status">
                <BadgeCheck className="mx-auto text-emerald-600" size={44} />
                <h3 className="mt-3 text-xl font-bold text-navy-950">We&apos;ve got your results</h3>
                {state.ref !== "RECEIVED" && (
                  <p className="mt-2 text-slate-600">
                    Reference <span className="font-mono font-semibold">{state.ref}</span>. A consultant will contact you within one business day to go through your plan.
                  </p>
                )}
                <a
                  href={whatsappLink(`Hello Orbitech, I scored ${result.score}/100 on the readiness check${state.ref && state.ref !== "RECEIVED" ? ` (ref ${state.ref})` : ""}. I'd like help closing my gaps.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn mt-5 bg-[#25D366] text-white"
                >
                  <MessageCircle size={18} /> Continue on WhatsApp
                </a>
              </div>
            ) : (
              <form action={action} className="card space-y-4 p-6" noValidate>
                <div>
                  <p className="text-lg font-bold text-navy-950">Get a consultant to review your plan</p>
                  <p className="mt-1 text-sm text-slate-600">Free, with no obligation. We confirm your gaps and send a fixed quote to close them.</p>
                </div>
                <input ref={tRef} type="hidden" name="_t" defaultValue="0" />
                <div className="hidden" aria-hidden="true">
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </div>
                <input type="hidden" name="employees" value={profile.employees} />
                <input type="hidden" name="turnoverBand" value={profile.turnoverBand} />
                <input type="hidden" name="bidsForGovernment" value={profile.bidsForGovernment ? "yes" : "no"} />
                <input type="hidden" name="sector" value={profile.sector} />
                {Object.entries(answers).map(([k, v]) => (
                  <input key={k} type="hidden" name={`q_${k}`} value={v} />
                ))}
                {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{state.error}</p>}
                <div>
                  <label className="label" htmlFor="r-name">Full name *</label>
                  <input id="r-name" name="name" className="input" autoComplete="name" aria-invalid={!!state.fieldErrors?.name} />
                  {state.fieldErrors?.name && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="r-company">Company</label>
                  <input id="r-company" name="company" className="input" autoComplete="organization" />
                </div>
                <div>
                  <label className="label" htmlFor="r-phone">Phone / WhatsApp *</label>
                  <input id="r-phone" name="phone" type="tel" className="input" autoComplete="tel" aria-invalid={!!state.fieldErrors?.phone} />
                  {state.fieldErrors?.phone && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="r-email">Email</label>
                  <input id="r-email" name="email" type="email" className="input" autoComplete="email" aria-invalid={!!state.fieldErrors?.email} />
                  {state.fieldErrors?.email && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="r-loc">Location</label>
                  <select id="r-loc" name="location" className="input" defaultValue="">
                    <option value="">Select area</option>
                    {ABUJA_AREAS.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-gold w-full py-3.5 text-base" disabled={pending}>
                  {pending ? "Sending…" : "Send me my reviewed plan"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
