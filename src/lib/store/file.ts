import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { buildEnquiry, matchesFilter } from "./shared";
import type { Activity, Enquiry, Store, Visit } from "./types";

/**
 * JSON-file store for local development and zero-config previews.
 * On Vercel the filesystem is ephemeral (/tmp), so production should set
 * DATABASE_URL — the console shows a warning while this store is active.
 */
type Data = { enquiries: Enquiry[]; activities: Activity[]; visits: Visit[] };

const MAX_VISITS = 50_000;

export function createFileStore(): Store {
  const dir = process.env.DATA_DIR ?? (process.env.VERCEL ? "/tmp/orbitech" : path.join(process.cwd(), ".data"));
  const file = path.join(dir, "store.json");
  let cache: Data | null = null;
  let queue: Promise<unknown> = Promise.resolve();

  async function load(): Promise<Data> {
    if (cache) return cache;
    try {
      cache = JSON.parse(await fs.readFile(file, "utf8")) as Data;
    } catch {
      cache = { enquiries: [], activities: [], visits: [] };
    }
    return cache;
  }

  function mutate<T>(fn: (d: Data) => T): Promise<T> {
    const run = queue.then(async () => {
      const d = await load();
      const result = fn(d);
      await fs.mkdir(dir, { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(d));
      await fs.rename(tmp, file);
      return result;
    });
    queue = run.catch(() => undefined);
    return run;
  }

  return {
    kind: "file",
    createEnquiry: (input) =>
      mutate((d) => {
        const e = buildEnquiry(input);
        d.enquiries.unshift(e);
        return e;
      }),
    async listEnquiries(filter = {}) {
      const d = await load();
      return d.enquiries.filter((e) => matchesFilter(e, filter)).slice(0, filter.limit ?? 500);
    },
    async getEnquiry(id) {
      const d = await load();
      return d.enquiries.find((e) => e.id === id) ?? null;
    },
    updateEnquiry: (id, patch) =>
      mutate((d) => {
        const e = d.enquiries.find((x) => x.id === id);
        if (!e) return null;
        Object.assign(e, patch, { updatedAt: new Date().toISOString() });
        return e;
      }),
    addActivity: (a) =>
      mutate((d) => {
        const act: Activity = { ...a, id: randomUUID(), createdAt: new Date().toISOString() };
        d.activities.unshift(act);
        return act;
      }),
    async listActivities(enquiryId) {
      const d = await load();
      return d.activities.filter((a) => a.enquiryId === enquiryId);
    },
    recordVisit: (v) =>
      mutate((d) => {
        d.visits.unshift({ ...v, id: randomUUID(), ts: new Date().toISOString() });
        if (d.visits.length > MAX_VISITS) d.visits.length = MAX_VISITS;
      }),
    async listVisits({ since, visitorId, limit = 20_000 }) {
      const d = await load();
      const t = since?.getTime() ?? 0;
      const out: Visit[] = [];
      for (const v of d.visits) {
        if (new Date(v.ts).getTime() < t) break;
        if (visitorId && v.visitorId !== visitorId) continue;
        out.push(v);
        if (out.length >= limit) break;
      }
      return out;
    },
  };
}
