export type ServiceCategory = "Tax" | "Payroll levies" | "Government contracts" | "Corporate & accounts";

export type Service = {
  slug: string;
  title: string;
  short: string;
  category: ServiceCategory;
  intro: string;
  whoNeeds: string[];
  included: string[];
  documents: string[];
  deadline?: string;
  tool?: { href: string; label: string };
  featured?: boolean;
};

export const SERVICES: Service[] = [
  {
    slug: "tax-health-check",
    title: "Tax Year 2027 Health Check",
    short: "Review your business against the 2026 tax laws before your first 2027 returns.",
    category: "Tax",
    featured: true,
    intro:
      "The Nigeria Tax Act and Tax Administration Act took effect on 1 January 2026. Your first returns under the new rules fall due in 2027: annual PAYE returns in January, ITF in April and CIT in June. We review where you stand now, so 2027 brings no surprises.",
    whoNeeds: [
      "Any company that has not yet reviewed how the 2026 reforms affect it",
      "Businesses close to the small-company threshold (0% CIT)",
      "Firms that bid for government or donor-funded work",
    ],
    included: [
      "A gap review across CIT, VAT, WHT, PAYE, pension, NSITF, ITF and CAC",
      "Small-company status check and development levy exposure",
      "PAYE re-computation on the new bands and rent relief",
      "A written Tax Year 2027 action plan with deadlines and owners",
    ],
    documents: ["CAC certificate & status report", "Last 2 years' tax returns / assessments", "Recent payroll schedule", "Latest management or audited accounts"],
    tool: { href: "/readiness", label: "Take the free readiness check" },
  },
  {
    slug: "company-income-tax",
    title: "Company Income Tax & Development Levy",
    short: "CIT computations, development levy and annual returns filed with NRS.",
    category: "Tax",
    featured: true,
    intro:
      "Large and medium companies pay 30% CIT plus the new 4% development levy, which replaces TET, the IT levy, NASENI and the Police Trust Fund levy. Small companies pay 0% but must still file. We prepare and file your computations and returns, and handle any queries from the Nigeria Revenue Service.",
    whoNeeds: ["Every registered company, including dormant and small companies", "Companies with a financial year ending in 2026, whose first returns under the new Act are due in 2027"],
    included: [
      "Tax computation, capital allowances and loss relief",
      "Development levy computation",
      "Small-company qualification analysis",
      "Filing on the NRS portal and evidence of filing",
      "Responses to NRS queries",
    ],
    documents: ["Audited or management financial statements", "Fixed asset register", "Prior year assessments", "WHT credit notes"],
    deadline: "Within 6 months of your financial year end (30 June for a December year end)",
    tool: { href: "/tools/company-tax", label: "Estimate your company tax" },
  },
  {
    slug: "vat-compliance",
    title: "VAT Compliance",
    short: "VAT registration, monthly returns, input VAT recovery and nil returns.",
    category: "Tax",
    intro:
      "VAT stays at 7.5%, but the 2025 Acts widened input VAT recovery to include assets and services. They also tightened e-invoicing and penalties. We register you, file every month and make sure you recover the input VAT you are owed.",
    whoNeeds: ["Companies above the small-company threshold that make taxable supplies", "Businesses that have missed nil returns", "Exporters (exports are now zero-rated)"],
    included: ["VAT registration", "Monthly VAT returns, including nil returns", "Input VAT reconciliation and recovery", "Review of VAT on invoices and contracts"],
    documents: ["Sales and purchase invoices", "Bank statements", "Previous VAT filings"],
    deadline: "21st of every month",
    tool: { href: "/tools/vat", label: "VAT calculator" },
  },
  {
    slug: "withholding-tax",
    title: "Withholding Tax",
    short: "Correct WHT deductions, monthly remittance and credit note tracking.",
    category: "Tax",
    intro:
      "WHT errors are among the most common audit findings. We apply the current WHT schedule to your payments, remit by the 21st and track the credit notes you are owed by your own customers.",
    whoNeeds: ["Companies paying contractors, consultants, rent, dividends or commissions", "Contractors who need WHT credit notes from government MDAs"],
    included: ["WHT rate mapping for your vendor list", "Monthly schedules and remittance", "Credit note reconciliation against your CIT"],
    documents: ["Vendor payment listing", "Contracts / invoices"],
    deadline: "21st of the following month",
  },
  {
    slug: "paye-payroll",
    title: "PAYE & Payroll Compliance",
    short: "Payroll on the 2026 PAYE bands, FCT-IRS remittance and annual returns.",
    category: "Payroll levies",
    featured: true,
    intro:
      "From 2026 the old CRA is gone. The first ₦800,000 is tax-free, the bands run from 15% to 25% and rent relief is 20% of rent, capped at ₦500,000. We rebuild your payroll on the new rules, remit to FCT-IRS (or your staff's state) and file the annual returns.",
    whoNeeds: ["Every employer, from 1 staff member upwards", "Companies still running payroll on pre-2026 tables"],
    included: [
      "Payroll re-computation on the 2026 bands",
      "Rent relief documentation for staff",
      "Monthly PAYE schedules and remittance",
      "Annual employer returns (due 31 January)",
      "Tax deduction cards and staff TCCs",
    ],
    documents: ["Payroll register", "Staff Tax IDs", "Rent receipts / tenancy agreements (for relief)"],
    deadline: "10th of the following month · annual returns by 31 January",
    tool: { href: "/tools/paye", label: "PAYE calculator" },
  },
  {
    slug: "pencom-compliance",
    title: "PenCom Compliance Certificate",
    short: "Pension remittance, group life cover and your PenCom compliance certificate.",
    category: "Payroll levies",
    intro:
      "Employers with 3 or more staff must remit 18% of basic, housing and transport pay to staff PFAs: 10% from the employer and 8% from the employee. They must also keep group life insurance in place. You need a PenCom certificate for BPP registration and every federal tender.",
    whoNeeds: ["Employers with 3+ staff", "Anyone bidding for public contracts"],
    included: ["Pension computation and remittance schedules", "Arrears reconciliation", "Group life insurance checks", "PenCom compliance certificate application"],
    documents: ["Payroll register", "PFA remittance evidence", "Group life policy"],
    deadline: "Within 7 working days of paying salaries",
    tool: { href: "/tools/payroll", label: "Payroll cost calculator" },
  },
  {
    slug: "itf-compliance",
    title: "ITF Registration & Compliance Certificate",
    short: "Industrial Training Fund registration, the 1% contribution and your ITF certificate.",
    category: "Payroll levies",
    featured: true,
    intro:
      "Under the ITF (Amendment) Act 2011, employers with 5 or more staff, or turnover of ₦50 million or more, must contribute 1% of annual payroll by 1 April each year. An ITF compliance certificate is a standard requirement for BPP registration and federal tenders. If you train your staff, up to 50% of the contribution can be reclaimed.",
    whoNeeds: ["Employers with 5+ staff or ₦50m+ turnover", "Contractors registering with BPP", "Companies that train staff and want the reimbursement"],
    included: [
      "ITF registration (Form 7A) at the Abuja area office",
      "Computation of the 1% contribution from audited payroll",
      "Payment schedule and filing",
      "ITF compliance certificate processing",
      "Training reimbursement claims",
    ],
    documents: ["CAC certificate", "Certified audited accounts", "Annual payroll / staff list", "Previous ITF receipts (if any)"],
    deadline: "1 April each year (on the previous year's payroll)",
    tool: { href: "/tools/payroll", label: "Calculate your ITF contribution" },
  },
  {
    slug: "nsitf-compliance",
    title: "NSITF Registration & Compliance Certificate",
    short: "Employees' Compensation Scheme registration, the 1% monthly contribution and your NSITF certificate.",
    category: "Payroll levies",
    featured: true,
    intro:
      "The Employees' Compensation Act 2010 requires every employer to contribute 1% of total monthly payroll to NSITF. The fund covers staff for workplace injury, disability and death. An NSITF clearance certificate is mandatory for BPP registration and federal contract bids, and NSITF compliance is often checked during inspections.",
    whoNeeds: ["Every employer in Nigeria, public or private", "Contractors on site work in construction, oil & gas, security and facility management"],
    included: ["Employer registration (ECS forms)", "Payroll assessment and 1% contribution schedule", "Arrears negotiation and reconciliation", "NSITF compliance certificate processing"],
    documents: ["CAC certificate & status report", "Staff list and monthly payroll", "Previous NSITF receipts (if any)"],
    deadline: "Monthly, with payroll",
    tool: { href: "/tools/payroll", label: "Calculate your NSITF contribution" },
  },
  {
    slug: "bpp-registration",
    title: "BPP Registration (IRR)",
    short: "Register on the National Database of Federal Contractors and get your BPP IRR.",
    category: "Government contracts",
    featured: true,
    intro:
      "Every company that bids for Federal Government contracts must be registered with the Bureau of Public Procurement. Registration produces an Interim Registration Report (IRR), which MDAs check at bid opening. Most rejections come from expired or missing certificates. We put together the full pack (TCC, PenCom, ITF, NSITF, CAC) and see your registration or renewal through.",
    whoNeeds: ["Contractors, consultants and suppliers to federal MDAs in Abuja", "Companies whose IRR has expired or whose certificates have changed", "New companies preparing for their first tender"],
    included: [
      "Eligibility review and document gap list",
      "Processing of TCC, PenCom, ITF and NSITF certificates where missing",
      "Online BPP registration and category selection",
      "IRR retrieval and renewal reminders",
      "Tender-readiness checklist for bid submissions",
    ],
    documents: [
      "CAC certificate, status report and memorandum & articles",
      "Tax Clearance Certificate (last 3 years)",
      "PenCom compliance certificate",
      "ITF compliance certificate",
      "NSITF compliance certificate",
      "Company profile, bank reference & sworn affidavit",
    ],
    deadline: "Renew annually and whenever a certificate expires",
  },
  {
    slug: "tax-clearance-certificate",
    title: "Tax Clearance Certificate (TCC)",
    short: "Clear filing gaps and get your company TCC, needed for tenders, banks and permits.",
    category: "Government contracts",
    intro:
      "A TCC confirms that your company has filed and paid for the past three years. You need one for BPP registration, government contracts, bank facilities and many licences. We find and close the gaps that block issuance, then apply for you.",
    whoNeeds: ["Companies bidding for contracts or applying for loans", "Companies with gaps in past filings"],
    included: ["3-year filing history review", "Resolution of outstanding returns and liabilities", "TCC application and follow-up"],
    documents: ["Tax ID","Last 3 years' returns and payment receipts", "Audited accounts"],
    deadline: "Apply early each January",
  },
  {
    slug: "cac-annual-returns",
    title: "CAC Annual Returns & Secretarial",
    short: "Annual returns, statutory registers, changes of directors and filings.",
    category: "Corporate & accounts",
    intro:
      "Missing CAC annual returns leads to penalties, an 'inactive' status and failed BPP and bank checks. We file your returns and keep your statutory records up to date.",
    whoNeeds: ["Every registered company and business name", "Companies with an 'inactive' CAC status"],
    included: ["Annual returns filing", "Change of directors, shareholders or address", "Persons with Significant Control (PSC) filings", "Status report retrieval"],
    documents: ["CAC registration documents", "Directors' and shareholders' details", "Financial statements (for companies)"],
  },
  {
    slug: "business-registration",
    title: "Business Registration",
    short: "CAC incorporation, Tax ID, bank account and statutory set-up done in one go.",
    category: "Corporate & accounts",
    intro:
      "We incorporate your company and register it for tax, pension, NSITF and ITF from the start, so it is ready to tender from the first month.",
    whoNeeds: ["New businesses and startups in Abuja", "Business names converting to limited companies"],
    included: ["Name reservation and incorporation", "Tax ID and VAT registration", "Employer registration for PAYE, pension, NSITF and ITF", "A first-year compliance calendar"],
    documents: ["Directors' IDs and passport photos", "Proposed names", "Registered office address"],
  },
  {
    slug: "bookkeeping-accounts",
    title: "Bookkeeping & Financial Statements",
    short: "Monthly books, management accounts and year-end statements, ready for audit.",
    category: "Corporate & accounts",
    intro:
      "Accurate digital books underpin every return, TCC and bid. With the NRS moving to e-invoicing and fiscalisation, paper records will no longer keep up. We keep your books monthly and prepare year-end statements for your auditors.",
    whoNeeds: ["SMEs without an in-house accountant", "Companies preparing for audit or funding"],
    included: ["Monthly bookkeeping & bank reconciliation", "Management accounts", "Year-end financial statements", "Audit support and liaison"],
    documents: ["Bank statements", "Invoices & receipts", "Payroll records"],
  },
  {
    slug: "tax-audit-support",
    title: "Tax Audit & Dispute Support",
    short: "Representation during NRS and FCT-IRS audits, assessments and objections.",
    category: "Tax",
    intro:
      "Received a demand notice, best-of-judgement assessment or audit letter? We review it, reconcile your records and represent you through objections and the Tax Appeal Tribunal process.",
    whoNeeds: ["Companies under NRS or FCT-IRS audit", "Businesses with disputed assessments"],
    included: ["Assessment review", "Reconciliation and response preparation", "Objection letters within statutory timelines", "Representation at meetings"],
    documents: ["Audit letter / notice of assessment", "Returns and payment evidence for the period"],
  },
];

export const SERVICE_BY_SLUG = Object.fromEntries(SERVICES.map((s) => [s.slug, s])) as Record<string, Service>;

export const SERVICE_OPTIONS = SERVICES.map((s) => ({ value: s.slug, label: s.title }));

export function serviceTitle(slug: string) {
  return SERVICE_BY_SLUG[slug]?.title ?? slug;
}
