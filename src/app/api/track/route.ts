import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { BOT_RE, parseUserAgent } from "@/lib/analytics";

const VISITOR_COOKIE = "orb_vid";
const SESSION_COOKIE = "orb_sid";

const Body = z.object({
  kind: z.enum(["pageview", "event"]).default("pageview"),
  name: z.string().max(80).default(""),
  path: z.string().max(300),
  referrer: z.string().max(500).default(""),
  utmSource: z.string().max(100).default(""),
  utmMedium: z.string().max(100).default(""),
  utmCampaign: z.string().max(100).default(""),
});

const decode = (v: string | null) => {
  if (!v) return "";
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};

export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) return new NextResponse(null, { status: 204 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (body.path.startsWith("/console")) return new NextResponse(null, { status: 204 });

  // Drop self-referrals so channels reflect where people came from.
  let referrer = body.referrer;
  try {
    if (referrer && new URL(referrer).host === request.nextUrl.host) referrer = "";
  } catch {
    referrer = "";
  }

  const existingVisitor = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = existingVisitor && /^[\w-]{8,64}$/.test(existingVisitor) ? existingVisitor : randomUUID();
  const existingSession = request.cookies.get(SESSION_COOKIE)?.value;
  const sessionId = existingSession && /^[\w-]{8,64}$/.test(existingSession) ? existingSession : randomUUID();
  const { device, browser } = parseUserAgent(ua);

  try {
    await getStore().recordVisit({
      kind: body.kind,
      name: body.name,
      visitorId,
      sessionId,
      path: body.path.split("?")[0],
      referrer: existingSession ? "" : referrer,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
      country: request.headers.get("x-vercel-ip-country") ?? "",
      region: decode(request.headers.get("x-vercel-ip-country-region")),
      city: decode(request.headers.get("x-vercel-ip-city")),
      device,
      browser,
      newVisitor: !existingVisitor,
    });
  } catch (e) {
    console.error("[track] failed to record visit", e);
  }

  const res = new NextResponse(null, { status: 204 });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 24 * 365 });
  res.cookies.set(SESSION_COOKIE, sessionId, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 30 });
  return res;
}
