"use server";

import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { getStore, type Priority } from "@/lib/store";
import { notifyNewEnquiry } from "@/lib/notify";
import { SERVICE_BY_SLUG } from "@/lib/services";
import { QUESTIONS, scoreReadiness, TURNOVER_BANDS, type Answer, type TurnoverBand } from "@/lib/tax/readiness";

export type FormState = { ok: boolean; ref?: string; error?: string; fieldErrors?: Record<string, string> };

const hits = new Map<string, number[]>();
function rateLimited(key: string, max = 5, windowMs = 10 * 60_000) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

const phoneRe = /^\+?[\d\s()-]{7,20}$/;

const Contact = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(120),
    company: z.string().trim().max(160).default(""),
    email: z.union([z.literal(""), z.email("Enter a valid email")]).default(""),
    phone: z.string().trim().regex(phoneRe, "Enter a valid phone number"),
    services: z.array(z.string()).max(15).default([]),
    message: z.string().trim().max(3000).default(""),
    location: z.string().trim().max(80).default(""),
    sector: z.string().trim().max(80).default(""),
    employees: z.coerce.number().int().min(0).max(1_000_000).optional(),
    turnoverBand: z.string().max(20).default(""),
    preferredContact: z.enum(["WhatsApp", "Phone call", "Email", "Office visit"]).default("WhatsApp"),
    source: z.enum(["contact", "callback", "tool"]).default("contact"),
  });

async function context() {
  const h = await headers();
  const jar = await cookies();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const attribution = (() => {
    try {
      return JSON.parse(jar.get("orb_attr")?.value ?? "{}") as Record<string, string>;
    } catch {
      return {};
    }
  })();
  return {
    ip,
    visitorId: jar.get("orb_vid")?.value ?? "",
    landingPath: String(attribution.landing ?? "").slice(0, 300),
    referrer: String(attribution.ref ?? "").slice(0, 500),
    utmSource: String(attribution.us ?? "").slice(0, 100),
    utmMedium: String(attribution.um ?? "").slice(0, 100),
    utmCampaign: String(attribution.uc ?? "").slice(0, 100),
  };
}

function isSpam(fd: FormData) {
  if (String(fd.get("website") ?? "")) return true; // honeypot
  const started = Number(fd.get("_t") ?? 0);
  return started > 0 && Date.now() - started < 2500;
}

const URGENT = /urgent|tender|bid|deadline|asap|immediately|this week|expir/i;
const CONTRACT_SERVICES = new Set(["bpp-registration", "itf-compliance", "nsitf-compliance", "tax-clearance-certificate", "pencom-compliance"]);

export async function submitEnquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isSpam(fd)) return { ok: true, ref: "RECEIVED" };
  const ctx = await context();
  if (rateLimited(`enq:${ctx.ip}`)) return { ok: false, error: "Too many submissions. Please message us on WhatsApp instead." };

  const parsed = Contact.safeParse({
    name: fd.get("name"),
    company: fd.get("company") ?? "",
    email: fd.get("email") ?? "",
    phone: fd.get("phone"),
    services: fd.getAll("services").map(String).filter((s) => s in SERVICE_BY_SLUG),
    message: fd.get("message") ?? "",
    location: fd.get("location") ?? "",
    sector: fd.get("sector") ?? "",
    employees: fd.get("employees") || undefined,
    turnoverBand: fd.get("turnoverBand") ?? "",
    preferredContact: fd.get("preferredContact") || undefined,
    source: fd.get("source") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const d = parsed.data;

  const big = ["100m-1b", "1b-20b", "over-20b"].includes(d.turnoverBand) || (d.employees ?? 0) >= 20;
  const priority: Priority =
    URGENT.test(d.message) || d.services.some((s) => CONTRACT_SERVICES.has(s)) || big ? "hot" : d.services.length || d.message.length > 40 ? "warm" : "cold";

  try {
    const store = getStore();
    const e = await store.createEnquiry({
      name: d.name,
      company: d.company,
      email: d.email,
      phone: d.phone,
      services: d.services,
      message: d.message,
      source: d.source,
      priority,
      location: d.location,
      sector: d.sector,
      employees: d.employees ?? null,
      turnoverBand: d.turnoverBand,
      preferredContact: d.preferredContact,
      score: null,
      readiness: null,
      nextFollowUpAt: new Date().toISOString(),
      ...ctx,
    });
    await store.addActivity({ enquiryId: e.id, type: "system", body: `Enquiry received from the ${d.source} form. Preferred contact: ${d.preferredContact}.`, author: "Website" });
    after(() => notifyNewEnquiry(e));
    return { ok: true, ref: e.ref };
  } catch (err) {
    console.error("[enquiry] save failed", err);
    return { ok: false, error: "We couldn't save your enquiry just now. Please message us on WhatsApp." };
  }
}

const ANSWERS = new Set<Answer>(["yes", "no", "unsure"]);

export async function submitReadiness(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isSpam(fd)) return { ok: true, ref: "RECEIVED" };
  const ctx = await context();
  if (rateLimited(`rd:${ctx.ip}`)) return { ok: false, error: "Too many submissions. Please try again later." };

  const name = String(fd.get("name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Please enter your name";
  if (!phoneRe.test(phone)) fieldErrors.phone = "Enter a valid phone number";
  if (email && !z.email().safeParse(email).success) fieldErrors.email = "Enter a valid email";
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please check the highlighted fields.", fieldErrors };

  const band = String(fd.get("turnoverBand") ?? "") as TurnoverBand;
  const profile = {
    employees: Math.max(0, Math.min(1_000_000, Number(fd.get("employees") ?? 0) || 0)),
    turnoverBand: TURNOVER_BANDS.some((b) => b.value === band) ? band : "under-25m",
    bidsForGovernment: fd.get("bidsForGovernment") === "yes",
    sector: String(fd.get("sector") ?? "").slice(0, 80),
  };
  const answers: Record<string, Answer> = {};
  for (const q of QUESTIONS) {
    const a = String(fd.get(`q_${q.id}`) ?? "") as Answer;
    if (ANSWERS.has(a)) answers[q.id] = a;
  }
  const result = scoreReadiness(profile, answers);

  try {
    const store = getStore();
    const e = await store.createEnquiry({
      name: name.slice(0, 120),
      company: String(fd.get("company") ?? "").trim().slice(0, 160),
      email,
      phone,
      services: [...new Set(result.gaps.map((g) => g.service))],
      message: `Tax Year 2027 readiness check: ${result.score}/100 (${result.grade}). ${result.gaps.length} gap(s) found.`,
      source: "readiness",
      priority: result.priority,
      location: String(fd.get("location") ?? "").slice(0, 80),
      sector: profile.sector,
      employees: profile.employees,
      turnoverBand: profile.turnoverBand,
      preferredContact: "WhatsApp",
      score: result.score,
      readiness: { profile, answers, gaps: result.gaps.map((g) => g.id) },
      nextFollowUpAt: new Date().toISOString(),
      ...ctx,
    });
    await store.addActivity({ enquiryId: e.id, type: "system", body: `Readiness check completed: ${result.score}/100, ${result.grade}.`, author: "Website" });
    after(() => notifyNewEnquiry(e));
    return { ok: true, ref: e.ref };
  } catch (err) {
    console.error("[readiness] save failed", err);
    return { ok: false, error: "We couldn't save your results just now, but your score is shown below." };
  }
}
