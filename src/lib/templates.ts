import { serviceTitle } from "./services";
import { site } from "./site";
import type { Enquiry } from "./store/types";

/** Normalises Nigerian numbers to international format for wa.me / tel links. */
export function intlPhone(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = `234${d.slice(1)}`;
  if (d.length === 10 && /^[789]/.test(d)) d = `234${d}`;
  return d;
}

export type Template = { id: string; label: string; text: string; subject: string };

export function followUpTemplates(e: Enquiry, sender: string): Template[] {
  const first = e.name.split(/\s+/)[0] || e.name;
  const svc = e.services.length ? e.services.slice(0, 3).map(serviceTitle).join(", ") : "your tax and compliance needs";
  const sign = `\n\n${sender}\n${site.name}\n${site.phone}`;
  const t: Template[] = [
    {
      id: "intro",
      label: "First response",
      subject: `Your enquiry with ${site.name} (${e.ref})`,
      text: `Hello ${first}, this is ${sender} from ${site.name}, Abuja. Thank you for your enquiry (ref ${e.ref}) about ${svc}.\n\nCould we schedule a short call to understand your situation? Are you free today or tomorrow?${sign}`,
    },
    {
      id: "docs",
      label: "Request documents",
      subject: `Documents needed: ${e.ref}`,
      text: `Hello ${first}, following our conversation, please send the following so we can prepare your quote:\n\n• CAC certificate & latest status report\n• Last 2 years' tax returns / receipts\n• Current payroll schedule (staff count & salaries)\n• Any existing PenCom, ITF, NSITF or BPP certificates\n\nYou can reply here with photos or PDFs.${sign}`,
    },
    {
      id: "nudge",
      label: "Gentle follow-up",
      subject: `Following up: ${e.ref}`,
      text: `Hello ${first}, I'm following up on your enquiry about ${svc}. Is this still a priority for you? We can start this week and keep the scope fixed. Just reply with a convenient time to talk.${sign}`,
    },
    {
      id: "proposal",
      label: "Proposal check-in",
      subject: `Your proposal from ${site.name}`,
      text: `Hello ${first}, I wanted to check whether you've had a chance to review our proposal. I'm happy to walk you through it or adjust the scope. Your first returns under the new tax laws are due in early 2027, so starting now gives us time to get everything right.${sign}`,
    },
  ];
  if (e.source === "readiness" && e.score != null) {
    t.unshift({
      id: "readiness",
      label: "Readiness results",
      subject: `Your Tax Year 2027 readiness score: ${e.score}/100`,
      text: `Hello ${first}, this is ${sender} from ${site.name}. Thank you for taking our Tax Year 2027 readiness check. You scored ${e.score}/100.\n\nI've reviewed your answers and can see some quick wins, especially around ${svc}. Could we have a 15-minute call to go through your action plan? No obligation.${sign}`,
    });
  }
  if (e.services.some((s) => ["bpp-registration", "itf-compliance", "nsitf-compliance"].includes(s))) {
    t.splice(1, 0, {
      id: "tender",
      label: "Tender deadline",
      subject: `Your federal contract certificates: ${e.ref}`,
      text: `Hello ${first}, regarding your ITF / NSITF / BPP needs: when does your tender close, and which certificates do you already have (TCC, PenCom, ITF, NSITF, BPP IRR)? Once I know that, I can tell you exactly what we can process in time.${sign}`,
    });
  }
  return t;
}
