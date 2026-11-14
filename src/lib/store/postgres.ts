import { Pool } from "pg";
import { buildEnquiry } from "./shared";
import type { Activity, Enquiry, EnquiryPatch, Store, Visit } from "./types";

const SCHEMA = `
create table if not exists enquiries (
  id uuid primary key,
  ref text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  company text not null default '',
  email text not null default '',
  phone text not null default '',
  services text[] not null default '{}',
  message text not null default '',
  source text not null,
  status text not null default 'new',
  priority text not null default 'warm',
  location text not null default '',
  sector text not null default '',
  employees integer,
  turnover_band text not null default '',
  preferred_contact text not null default '',
  score integer,
  readiness jsonb,
  next_follow_up_at timestamptz,
  last_contacted_at timestamptz,
  assigned_to text not null default '',
  estimated_value numeric,
  visitor_id text not null default '',
  landing_path text not null default '',
  referrer text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default ''
);
create index if not exists enquiries_created_idx on enquiries (created_at desc);
create index if not exists enquiries_followup_idx on enquiries (next_follow_up_at) where status not in ('won','lost');

create table if not exists enquiry_activities (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  created_at timestamptz not null default now(),
  type text not null,
  body text not null default '',
  author text not null default ''
);
create index if not exists activities_enquiry_idx on enquiry_activities (enquiry_id, created_at desc);

create table if not exists visits (
  id bigserial primary key,
  ts timestamptz not null default now(),
  kind text not null default 'pageview',
  name text not null default '',
  visitor_id text not null,
  session_id text not null,
  path text not null,
  referrer text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  country text not null default '',
  region text not null default '',
  city text not null default '',
  device text not null default '',
  browser text not null default '',
  new_visitor boolean not null default false
);
create index if not exists visits_ts_idx on visits (ts desc);
create index if not exists visits_visitor_idx on visits (visitor_id, ts desc);
`;

type Row = Record<string, unknown>;
const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v == null ? null : String(v));

function toEnquiry(r: Row): Enquiry {
  return {
    id: String(r.id),
    ref: String(r.ref),
    createdAt: iso(r.created_at)!,
    updatedAt: iso(r.updated_at)!,
    name: String(r.name),
    company: String(r.company),
    email: String(r.email),
    phone: String(r.phone),
    services: (r.services as string[]) ?? [],
    message: String(r.message),
    source: r.source as Enquiry["source"],
    status: r.status as Enquiry["status"],
    priority: r.priority as Enquiry["priority"],
    location: String(r.location),
    sector: String(r.sector),
    employees: r.employees == null ? null : Number(r.employees),
    turnoverBand: String(r.turnover_band),
    preferredContact: String(r.preferred_contact),
    score: r.score == null ? null : Number(r.score),
    readiness: r.readiness ?? null,
    nextFollowUpAt: iso(r.next_follow_up_at),
    lastContactedAt: iso(r.last_contacted_at),
    assignedTo: String(r.assigned_to),
    estimatedValue: r.estimated_value == null ? null : Number(r.estimated_value),
    visitorId: String(r.visitor_id),
    landingPath: String(r.landing_path),
    referrer: String(r.referrer),
    utmSource: String(r.utm_source),
    utmMedium: String(r.utm_medium),
    utmCampaign: String(r.utm_campaign),
  };
}

function toVisit(r: Row): Visit {
  return {
    id: String(r.id),
    ts: iso(r.ts)!,
    kind: r.kind as Visit["kind"],
    name: String(r.name),
    visitorId: String(r.visitor_id),
    sessionId: String(r.session_id),
    path: String(r.path),
    referrer: String(r.referrer),
    utmSource: String(r.utm_source),
    utmMedium: String(r.utm_medium),
    utmCampaign: String(r.utm_campaign),
    country: String(r.country),
    region: String(r.region),
    city: String(r.city),
    device: String(r.device),
    browser: String(r.browser),
    newVisitor: Boolean(r.new_visitor),
  };
}

const PATCH_COLUMNS: Record<keyof EnquiryPatch, string> = {
  status: "status",
  priority: "priority",
  nextFollowUpAt: "next_follow_up_at",
  lastContactedAt: "last_contacted_at",
  assignedTo: "assigned_to",
  estimatedValue: "estimated_value",
};

export function createPostgresStore(connectionString: string): Store {
  const pool = new Pool({
    connectionString,
    max: 5,
    ssl: /localhost|127\.0\.0\.1/.test(connectionString) || /sslmode=disable/.test(connectionString) ? undefined : { rejectUnauthorized: false },
  });
  let ready: Promise<void> | null = null;
  const init = () => (ready ??= pool.query(SCHEMA).then(() => undefined).catch((e) => { ready = null; throw e; }));
  const q = async (text: string, values: unknown[] = []) => {
    await init();
    return pool.query(text, values);
  };

  return {
    kind: "postgres",
    async createEnquiry(input) {
      const e = buildEnquiry(input);
      const { rows } = await q(
        `insert into enquiries (id, ref, name, company, email, phone, services, message, source, status, priority, location, sector,
          employees, turnover_band, preferred_contact, score, readiness, next_follow_up_at, visitor_id, landing_path, referrer,
          utm_source, utm_medium, utm_campaign)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) returning *`,
        [e.id, e.ref, e.name, e.company, e.email, e.phone, e.services, e.message, e.source, e.status, e.priority, e.location, e.sector,
          e.employees, e.turnoverBand, e.preferredContact, e.score, e.readiness == null ? null : JSON.stringify(e.readiness),
          e.nextFollowUpAt, e.visitorId, e.landingPath, e.referrer, e.utmSource, e.utmMedium, e.utmCampaign],
      );
      return toEnquiry(rows[0]);
    },
    async listEnquiries(f = {}) {
      const where: string[] = [];
      const vals: unknown[] = [];
      const status = f.status ?? "all";
      if (status === "open") where.push(`status not in ('won','lost')`);
      else if (status !== "all") where.push(`status = $${vals.push(status)}`);
      if (f.priority) where.push(`priority = $${vals.push(f.priority)}`);
      if (f.service) where.push(`$${vals.push(f.service)} = any(services)`);
      if (f.q) {
        const p = `$${vals.push(`%${f.q}%`)}`;
        where.push(`(name ilike ${p} or company ilike ${p} or email ilike ${p} or phone ilike ${p} or ref ilike ${p} or message ilike ${p} or location ilike ${p})`);
      }
      const sql = `select * from enquiries ${where.length ? `where ${where.join(" and ")}` : ""} order by created_at desc limit $${vals.push(f.limit ?? 500)}`;
      const { rows } = await q(sql, vals);
      return rows.map(toEnquiry);
    },
    async getEnquiry(id) {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
      const { rows } = await q(`select * from enquiries where id = $1`, [id]);
      return rows[0] ? toEnquiry(rows[0]) : null;
    },
    async updateEnquiry(id, patch) {
      const sets: string[] = [];
      const vals: unknown[] = [];
      for (const [k, v] of Object.entries(patch)) {
        const col = PATCH_COLUMNS[k as keyof EnquiryPatch];
        if (col) sets.push(`${col} = $${vals.push(v)}`);
      }
      if (!sets.length) return this.getEnquiry(id);
      sets.push("updated_at = now()");
      const { rows } = await q(`update enquiries set ${sets.join(", ")} where id = $${vals.push(id)} returning *`, vals);
      return rows[0] ? toEnquiry(rows[0]) : null;
    },
    async addActivity(a) {
      const { rows } = await q(
        `insert into enquiry_activities (enquiry_id, type, body, author) values ($1,$2,$3,$4) returning *`,
        [a.enquiryId, a.type, a.body, a.author],
      );
      const r = rows[0];
      return { id: String(r.id), enquiryId: String(r.enquiry_id), createdAt: iso(r.created_at)!, type: r.type, body: r.body, author: r.author } as Activity;
    },
    async listActivities(enquiryId) {
      const { rows } = await q(`select * from enquiry_activities where enquiry_id = $1 order by created_at desc`, [enquiryId]);
      return rows.map((r) => ({ id: String(r.id), enquiryId: String(r.enquiry_id), createdAt: iso(r.created_at)!, type: r.type, body: r.body, author: r.author }));
    },
    async recordVisit(v) {
      await q(
        `insert into visits (kind, name, visitor_id, session_id, path, referrer, utm_source, utm_medium, utm_campaign, country, region, city, device, browser, new_visitor)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [v.kind, v.name, v.visitorId, v.sessionId, v.path, v.referrer, v.utmSource, v.utmMedium, v.utmCampaign, v.country, v.region, v.city, v.device, v.browser, v.newVisitor],
      );
    },
    async listVisits({ since, visitorId, limit = 20_000 }) {
      const where: string[] = [];
      const vals: unknown[] = [];
      if (since) where.push(`ts >= $${vals.push(since)}`);
      if (visitorId) where.push(`visitor_id = $${vals.push(visitorId)}`);
      const { rows } = await q(
        `select * from visits ${where.length ? `where ${where.join(" and ")}` : ""} order by ts desc limit $${vals.push(limit)}`,
        vals,
      );
      return rows.map(toVisit);
    },
  };
}
