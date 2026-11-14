# Orbitech Tax & Compliance

Website, tax and compliance engine, and lead console for an Abuja tax practice. Built for Nigeria's 2026 tax laws: the Nigeria Tax Act 2025 and the Nigeria Tax Administration Act 2025.

## What's in it

**Public site**
- Service pages for CIT and the development levy, VAT, WHT, PAYE, PenCom, **ITF**, **NSITF**, **BPP (IRR)**, TCC, CAC, bookkeeping and tax audits (`src/lib/services.ts`).
- A federal contract landing page (`/government-contracts`) covering the TCC, PenCom, ITF, NSITF, BPP and CAC certificate pack.
- A 2026 tax reform guide (`/tax-reform`) built around the "Tax Year 2027" message.

**Compliance engine** (`src/lib/tax/`)
- `pit.ts`: PAYE on the 2026 bands, with rent relief, pension, NHF and the minimum-wage exemption.
- `payroll.ts`: true employer cost per employee, covering PAYE, pension at 10% + 8%, NSITF 1%, ITF 1% and NHF 2.5%.
- `company.ts`: small-company test, 30% CIT, 4% development levy, minimum-ETR flag and VAT.
- `readiness.ts`: Tax Year 2027 readiness score, gap list and lead priority.
- `calendar.ts`: compliance deadlines, with `.ics` export.
- **All statutory rates live in `rules.ts`.** Update them there when the law or guidance changes.

**Console** (`/console`, password protected)
- Dashboard: visitors, enquiries, follow-ups due, pipeline value, traffic sources, top pages, demand by service and tool usage.
- Enquiries: search and filter by status, priority or service, and export to CSV.
- Enquiry detail: status, priority, owner and fee; call, WhatsApp, email or meeting log; next follow-up; message templates; the visitor's journey before they enquired.
- Follow-ups: overdue, today and upcoming, with one-click WhatsApp, call or snooze.
- Visitors: first-party analytics (sessions, sources, pages, devices, locations on Vercel). No IP addresses are stored and bots are filtered out.

## Setup

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD at minimum
npm run dev
```

Without `DATABASE_URL`, data goes to `.data/store.json`. That is fine locally, but **on Vercel it is temporary**, so production needs Postgres. Any provider works (Neon, Supabase, Vercel Postgres). The tables are created automatically on first use.

## Deploy (Vercel)

1. Add a Postgres database and set `DATABASE_URL`.
2. Set `ADMIN_PASSWORD` or `ADMIN_USERS`, plus `ADMIN_SESSION_SECRET` (a long random string).
3. Optional: set `RESEND_API_KEY` and `NOTIFY_EMAIL` to get an email for every new enquiry.
4. Set `NEXT_PUBLIC_SITE_URL` to the production domain.

## Scripts

`npm run dev` · `npm run build` · `npm test` (tax engine tests) · `npm run typecheck` · `npm run lint`

## Tax rules: items to confirm

- The small-company turnover threshold is set to **₦50m** (per the EY and KPMG summaries of the signed Act). Some commentary cites ₦100m. Confirm against the gazetted text and change `SMALL_COMPANY_TURNOVER` if needed.
- The pension deadline in the calendar assumes salaries are paid at month end.
