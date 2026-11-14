import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth-token";
import { getStore, STATUSES, type EnquiryFilter, type Priority } from "@/lib/store";
import { serviceTitle } from "@/lib/services";

const cell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // prevent spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(request: NextRequest) {
  if (!(await verifySession(request.cookies.get(SESSION_COOKIE)?.value))) return new NextResponse("Unauthorized", { status: 401 });
  const p = request.nextUrl.searchParams;
  const status = p.get("status") ?? "all";
  const priority = p.get("priority");
  const filter: EnquiryFilter = {
    status: ([...STATUSES, "open", "all"] as string[]).includes(status) ? (status as EnquiryFilter["status"]) : "all",
    q: p.get("q") || undefined,
    priority: priority && ["hot", "warm", "cold"].includes(priority) ? (priority as Priority) : undefined,
    service: p.get("service") || undefined,
    limit: 10_000,
  };
  const rows = await getStore().listEnquiries(filter);
  const header = ["Ref", "Received", "Name", "Company", "Phone", "Email", "Status", "Priority", "Services", "Source", "Score", "Location", "Sector", "Staff", "Turnover", "Next follow-up", "Last contacted", "Owner", "Est. fee", "Message", "Landing page", "UTM source", "UTM campaign"];
  const lines = [header.join(",")];
  for (const e of rows) {
    lines.push(
      [e.ref, e.createdAt, e.name, e.company, e.phone, e.email, e.status, e.priority, e.services.map(serviceTitle).join("; "), e.source, e.score, e.location, e.sector, e.employees, e.turnoverBand, e.nextFollowUpAt, e.lastContactedAt, e.assignedTo, e.estimatedValue, e.message, e.landingPath, e.utmSource, e.utmCampaign]
        .map(cell)
        .join(","),
    );
  }
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="orbitech-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
