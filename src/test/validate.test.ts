import { describe, expect, it } from "vitest";
import { parseBillId, parseCongress, parseLimit, parseState } from "../../supabase/functions/_shared/validate";

describe("edge-function input validation", () => {
  it("parseCongress defaults and bounds", () => {
    expect(parseCongress(undefined)).toBe(119);
    expect(parseCongress("118")).toBe(118);
    expect(parseCongress(92)).toBeNull();
    expect(parseCongress("abc")).toBeNull();
  });

  it("parseLimit defaults and bounds", () => {
    expect(parseLimit(undefined, 10)).toBe(10);
    expect(parseLimit("250")).toBe(250);
    expect(parseLimit(0)).toBeNull();
    expect(parseLimit(251)).toBeNull();
  });

  it("parseBillId accepts real bill ids only", () => {
    expect(parseBillId("HR1234")).toEqual({ type: "hr", number: "1234", id: "hr1234" });
    expect(parseBillId("sres946")).toEqual({ type: "sres", number: "946", id: "sres946" });
    expect(parseBillId("hr1234; drop table")).toBeNull();
    expect(parseBillId(42)).toBeNull();
  });

  it("parseState accepts two-letter codes", () => {
    expect(parseState("mn")).toBe("MN");
    expect(parseState("Minnesota")).toBeNull();
  });
});
