import { randomUUID } from "node:crypto";
import type { Enquiry, EnquiryFilter, NewEnquiry } from "./types";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newRef(now = new Date()) {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  let tail = "";
  for (let i = 0; i < 4; i++) tail += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `ORB-${yy}${mm}-${tail}`;
}

export function buildEnquiry(input: NewEnquiry): Enquiry {
  const now = new Date().toISOString();
  return {
    ...input,
    id: randomUUID(),
    ref: newRef(),
    createdAt: now,
    updatedAt: now,
    status: input.status ?? "new",
    lastContactedAt: null,
    assignedTo: "",
    estimatedValue: null,
  };
}

export function matchesFilter(e: Enquiry, f: EnquiryFilter = {}) {
  const status = f.status ?? "all";
  if (status === "open" && (e.status === "won" || e.status === "lost")) return false;
  if (status !== "open" && status !== "all" && e.status !== status) return false;
  if (f.priority && e.priority !== f.priority) return false;
  if (f.service && !e.services.includes(f.service)) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = [e.name, e.company, e.email, e.phone, e.ref, e.message, e.location].join(" ").toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}
