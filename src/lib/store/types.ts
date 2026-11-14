export const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal sent",
  won: "Won",
  lost: "Lost",
};

export type Priority = "hot" | "warm" | "cold";
export type EnquirySource = "contact" | "readiness" | "tool" | "callback";

export type Enquiry = {
  id: string;
  ref: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  services: string[];
  message: string;
  source: EnquirySource;
  status: Status;
  priority: Priority;
  location: string;
  sector: string;
  employees: number | null;
  turnoverBand: string;
  preferredContact: string;
  score: number | null;
  readiness: unknown;
  nextFollowUpAt: string | null;
  lastContactedAt: string | null;
  assignedTo: string;
  estimatedValue: number | null;
  visitorId: string;
  landingPath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

export type NewEnquiry = Omit<Enquiry, "id" | "ref" | "createdAt" | "updatedAt" | "status" | "lastContactedAt" | "assignedTo" | "estimatedValue"> & {
  status?: Status;
};

export type ActivityType = "note" | "call" | "whatsapp" | "email" | "meeting" | "status" | "system" | "followup";

export type Activity = {
  id: string;
  enquiryId: string;
  createdAt: string;
  type: ActivityType;
  body: string;
  author: string;
};

export type Visit = {
  id: string;
  ts: string;
  kind: "pageview" | "event";
  name: string;
  visitorId: string;
  sessionId: string;
  path: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  country: string;
  region: string;
  city: string;
  device: string;
  browser: string;
  newVisitor: boolean;
};

export type EnquiryFilter = {
  status?: Status | "open" | "all";
  q?: string;
  priority?: Priority;
  service?: string;
  limit?: number;
};

export type EnquiryPatch = Partial<
  Pick<Enquiry, "status" | "priority" | "nextFollowUpAt" | "lastContactedAt" | "assignedTo" | "estimatedValue">
>;

export interface Store {
  readonly kind: "postgres" | "file";
  createEnquiry(input: NewEnquiry): Promise<Enquiry>;
  listEnquiries(filter?: EnquiryFilter): Promise<Enquiry[]>;
  getEnquiry(id: string): Promise<Enquiry | null>;
  updateEnquiry(id: string, patch: EnquiryPatch): Promise<Enquiry | null>;
  addActivity(a: Omit<Activity, "id" | "createdAt">): Promise<Activity>;
  listActivities(enquiryId: string): Promise<Activity[]>;
  recordVisit(v: Omit<Visit, "id" | "ts">): Promise<void>;
  /** Visits since `since`, newest first, capped. */
  listVisits(opts: { since?: Date; visitorId?: string; limit?: number }): Promise<Visit[]>;
}
