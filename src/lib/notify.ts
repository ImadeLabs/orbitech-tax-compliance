import "server-only";
import { Resend } from "resend";
import { serviceTitle } from "./services";
import { site } from "./site";
import type { Enquiry } from "./store/types";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Emails the team about a new enquiry and (optionally) acknowledges the client.
 * No-ops unless RESEND_API_KEY and NOTIFY_EMAIL are set.
 */
export async function notifyNewEnquiry(e: Enquiry) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;
  const from = process.env.RESEND_FROM ?? "Orbitech Website <onboarding@resend.dev>";
  const resend = new Resend(key);
  const consoleUrl = `${site.url}/console/enquiries/${e.id}`;
  const rows: [string, string][] = [
    ["Reference", e.ref],
    ["Name", e.name],
    ["Company", e.company],
    ["Phone", e.phone],
    ["Email", e.email],
    ["Location", e.location],
    ["Services", e.services.map(serviceTitle).join(", ")],
    ["Readiness score", e.score == null ? "" : `${e.score}/100`],
    ["Priority", e.priority.toUpperCase()],
    ["Message", e.message],
  ];

  const html = `<h2 style="font-family:sans-serif">New ${e.priority} enquiry · ${esc(e.ref)}</h2>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>`)
    .join("")}</table>
<p style="font-family:sans-serif"><a href="${consoleUrl}">Open in console →</a></p>`;

  try {
    await resend.emails.send({ from, to: to.split(",").map((s) => s.trim()), subject: `[${e.priority.toUpperCase()}] New enquiry from ${e.name}${e.company ? ` (${e.company})` : ""}`, html, replyTo: e.email || undefined });
    if (process.env.RESEND_ACK_CLIENT === "true" && e.email) {
      await resend.emails.send({
        from,
        to: e.email,
        subject: `We've received your enquiry · ${e.ref}`,
        html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.6"><p>Hello ${esc(e.name.split(" ")[0])},</p>
<p>Thank you for contacting ${site.name}. Your reference is <strong>${esc(e.ref)}</strong>. A consultant will contact you within one business day${e.preferredContact ? ` by ${esc(e.preferredContact)}` : ""}.</p>
<p>If it is urgent, message us on WhatsApp: <a href="https://wa.me/${site.whatsapp}">${site.phone}</a>.</p>
<p>— ${site.name}, ${site.city}</p></div>`,
      });
    }
  } catch (err) {
    console.error("[notify] email failed", err);
  }
}
