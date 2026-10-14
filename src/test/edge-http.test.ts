import { describe, expect, it, vi } from "vitest";
import { fail, rateLimit, readJsonObject } from "../../supabase/functions/_shared/http";
import {
  parseBillId,
  parseBioguideId,
  parseCongress,
  parseLimit,
  parseState,
} from "../../supabase/functions/_shared/validate";

const req = (ip: string, body?: unknown) =>
  new Request("https://example.test/fn", {
    method: "POST",
    headers: { "x-forwarded-for": ip, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("fail", () => {
  it("logs the real error but returns only the public message", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = fail(500, "Something went wrong.", new Error("CONGRESS_API_KEY is not configured"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: "Something went wrong." });
    expect(JSON.stringify(body)).not.toContain("CONGRESS_API_KEY");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("rateLimit", () => {
  it("allows up to the limit then returns 429 for the same ip", () => {
    const opts = { limit: 3, windowMs: 60_000 };
    expect(rateLimit(req("10.0.0.1"), opts)).toBeNull();
    expect(rateLimit(req("10.0.0.1"), opts)).toBeNull();
    expect(rateLimit(req("10.0.0.1"), opts)).toBeNull();
    const blocked = rateLimit(req("10.0.0.1"), opts);
    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get("Retry-After")).toBeTruthy();
    // a different client is unaffected
    expect(rateLimit(req("10.0.0.2"), opts)).toBeNull();
  });
});

describe("readJsonObject", () => {
  it("returns {} for an empty or invalid body and null for non-objects", async () => {
    expect(await readJsonObject(req("1.1.1.1"))).toEqual({});
    expect(await readJsonObject(new Request("https://x.test", { method: "POST", body: "nope" }))).toEqual({});
    expect(await readJsonObject(req("1.1.1.1", [1, 2]))).toBeNull();
    expect(await readJsonObject(req("1.1.1.1", { a: 1 }))).toEqual({ a: 1 });
  });
});

describe("validators", () => {
  it("congress and limit ranges", () => {
    expect(parseCongress(undefined)).toBe(119);
    expect(parseCongress("118")).toBe(118);
    expect(parseCongress(92)).toBeNull();
    expect(parseCongress("131")).toBeNull();
    expect(parseCongress("abc")).toBeNull();
    expect(parseLimit(undefined, 10)).toBe(10);
    expect(parseLimit(250)).toBe(250);
    expect(parseLimit(0)).toBeNull();
    expect(parseLimit(251)).toBeNull();
  });

  it("bill and member ids", () => {
    expect(parseBillId("HR1234")).toEqual({ type: "hr", number: "1234", id: "hr1234" });
    expect(parseBillId("sjres12")).toMatchObject({ type: "sjres" });
    expect(parseBillId("hr123456")).toBeNull();
    expect(parseBillId("../etc")).toBeNull();
    expect(parseBioguideId("a000360")).toBe("A000360");
    expect(parseBioguideId("A00036")).toBeNull();
  });

  it("states", () => {
    expect(parseState("ca")).toBe("CA");
    expect(parseState("XX")).toBeNull();
    expect(parseState(5)).toBeNull();
  });
});
