import { describe, expect, it } from "vitest";
import { createPostgresStore } from "./postgres";

const url = process.env.TEST_DATABASE_URL;
describe.skipIf(!url)("postgres store", () => {
  it("round-trips enquiries, activities and visits", async () => {
    const s = createPostgresStore(url!);
    const e = await s.createEnquiry({
      name: "PG Test", company: "Co", email: "", phone: "08030000000", services: ["itf-compliance"], message: "hi", source: "contact",
      priority: "hot", location: "", sector: "", employees: 5, turnoverBand: "", preferredContact: "WhatsApp", score: 50,
      readiness: { a: 1 }, nextFollowUpAt: new Date().toISOString(), visitorId: "v-123456789", landingPath: "/", referrer: "", utmSource: "", utmMedium: "", utmCampaign: "",
    });
    expect(e.ref).toMatch(/^ORB-/);
    expect((await s.listEnquiries({ service: "itf-compliance", q: "pg test" })).some((x) => x.id === e.id)).toBe(true);
    const u = await s.updateEnquiry(e.id, { status: "qualified", estimatedValue: 450000 });
    expect(u?.status).toBe("qualified");
    expect(u?.estimatedValue).toBe(450000);
    await s.addActivity({ enquiryId: e.id, type: "call", body: "called", author: "Ada" });
    expect((await s.listActivities(e.id))[0].body).toBe("called");
    await s.recordVisit({ kind: "pageview", name: "", visitorId: "v-123456789", sessionId: "s-123456789", path: "/", referrer: "", utmSource: "", utmMedium: "", utmCampaign: "", country: "NG", region: "FC", city: "Abuja", device: "Mobile", browser: "Chrome", newVisitor: true });
    expect((await s.listVisits({ visitorId: "v-123456789" }))[0].city).toBe("Abuja");
    expect(await s.getEnquiry("not-a-uuid")).toBeNull();
  });
});
