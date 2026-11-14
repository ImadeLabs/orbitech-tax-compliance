"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkCredentials, configuredUsers, SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/lib/auth-token";
import { requireAdmin } from "@/lib/auth";
import { getStore, STATUSES, STATUS_LABEL, type ActivityType, type Priority, type Status } from "@/lib/store";

const attempts = new Map<string, { n: number; until: number }>();

export async function login(_prev: { error?: string }, fd: FormData): Promise<{ error?: string }> {
  if (!configuredUsers().length) return { error: "Console is not configured. Set ADMIN_PASSWORD (or ADMIN_USERS) in your environment." };
  const ip = ((await headers()).get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const a = attempts.get(ip);
  if (a && a.until > Date.now()) return { error: "Too many attempts. Try again in a few minutes." };

  const user = await checkCredentials(String(fd.get("name") ?? ""), String(fd.get("password") ?? ""));
  if (!user) {
    const n = (a?.n ?? 0) + 1;
    attempts.set(ip, { n, until: n >= 5 ? Date.now() + 10 * 60_000 : 0 });
    return { error: "Incorrect name or password." };
  }
  attempts.delete(ip);
  (await cookies()).set(SESSION_COOKIE, await signSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  const next = String(fd.get("next") ?? "");
  redirect(next.startsWith("/console") && !next.startsWith("//") ? next : "/console");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/console/login");
}

function followUpFrom(v: string): string | null | undefined {
  const now = Date.now();
  const day = 86400_000;
  switch (v) {
    case "":
    case "keep":
      return undefined;
    case "none":
      return null;
    case "2h":
      return new Date(now + 2 * 3600_000).toISOString();
    case "1d":
      return new Date(now + day).toISOString();
    case "3d":
      return new Date(now + 3 * day).toISOString();
    case "1w":
      return new Date(now + 7 * day).toISOString();
    case "2w":
      return new Date(now + 14 * day).toISOString();
    case "1m":
      return new Date(now + 30 * day).toISOString();
    default: {
      // yyyy-mm-ddThh:mm from a datetime-local input, interpreted as Lagos time (UTC+1)
      const t = Date.parse(`${v}:00+01:00`);
      return Number.isFinite(t) ? new Date(t).toISOString() : undefined;
    }
  }
}

const CONTACT_TYPES = new Set<ActivityType>(["call", "whatsapp", "email", "meeting"]);
const TYPE_LABEL: Record<string, string> = { note: "Note", call: "Call", whatsapp: "WhatsApp", email: "Email", meeting: "Meeting" };

export async function logActivity(fd: FormData) {
  const session = await requireAdmin();
  const id = String(fd.get("id"));
  const type = String(fd.get("type") ?? "note") as ActivityType;
  const body = String(fd.get("body") ?? "").trim().slice(0, 4000);
  const exact = String(fd.get("followUpExact") ?? "").trim();
  const followUp = followUpFrom(exact || String(fd.get("followUp") ?? ""));
  const store = getStore();
  const e = await store.getEnquiry(id);
  if (!e) return;

  if (body || CONTACT_TYPES.has(type)) {
    await store.addActivity({ enquiryId: id, type: TYPE_LABEL[type] ? type : "note", body: body || `${TYPE_LABEL[type]} logged`, author: session.user });
  }
  const patch: Parameters<typeof store.updateEnquiry>[1] = {};
  if (CONTACT_TYPES.has(type)) {
    patch.lastContactedAt = new Date().toISOString();
    if (e.status === "new") patch.status = "contacted";
  }
  if (followUp !== undefined) patch.nextFollowUpAt = followUp;
  if (Object.keys(patch).length) await store.updateEnquiry(id, patch);
  if (followUp) {
    await store.addActivity({ enquiryId: id, type: "followup", body: `Next follow-up set for ${new Date(followUp).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })}`, author: session.user });
  }
  revalidatePath("/console", "layout");
}

export async function updateEnquiry(fd: FormData) {
  const session = await requireAdmin();
  const id = String(fd.get("id"));
  const store = getStore();
  const e = await store.getEnquiry(id);
  if (!e) return;
  const patch: Parameters<typeof store.updateEnquiry>[1] = {};
  const notes: string[] = [];

  const status = fd.get("status") as Status | null;
  if (status && STATUSES.includes(status) && status !== e.status) {
    patch.status = status;
    notes.push(`Status: ${STATUS_LABEL[e.status]} → ${STATUS_LABEL[status]}`);
    if (status === "won" || status === "lost") patch.nextFollowUpAt = null;
  }
  const priority = fd.get("priority") as Priority | null;
  if (priority && ["hot", "warm", "cold"].includes(priority) && priority !== e.priority) {
    patch.priority = priority;
    notes.push(`Priority → ${priority}`);
  }
  if (fd.has("assignedTo")) {
    const a = String(fd.get("assignedTo")).trim().slice(0, 80);
    if (a !== e.assignedTo) {
      patch.assignedTo = a;
      notes.push(a ? `Assigned to ${a}` : "Unassigned");
    }
  }
  if (fd.has("estimatedValue")) {
    const raw = String(fd.get("estimatedValue")).replace(/[^\d.]/g, "");
    const v = raw ? Number(raw) : null;
    if (v !== e.estimatedValue) {
      patch.estimatedValue = v;
      notes.push(v == null ? "Estimated value cleared" : `Estimated value ₦${v.toLocaleString("en-NG")}`);
    }
  }
  const reason = String(fd.get("reason") ?? "").trim();
  if (Object.keys(patch).length) {
    await store.updateEnquiry(id, patch);
    await store.addActivity({ enquiryId: id, type: "status", body: notes.join(" · ") + (reason ? `: ${reason}` : ""), author: session.user });
  }
  revalidatePath("/console", "layout");
}

export async function snooze(fd: FormData) {
  const session = await requireAdmin();
  const id = String(fd.get("id"));
  const followUp = followUpFrom(String(fd.get("followUp") ?? ""));
  if (followUp === undefined) return;
  await getStore().updateEnquiry(id, { nextFollowUpAt: followUp });
  await getStore().addActivity({
    enquiryId: id,
    type: "followup",
    body: followUp ? `Follow-up moved to ${new Date(followUp).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })}` : "Follow-up cleared",
    author: session.user,
  });
  revalidatePath("/console", "layout");
}
