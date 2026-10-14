import { describe, expect, it } from "vitest";
import { isHealthBill, wordPattern } from "../../supabase/functions/_shared/health-filter";

describe("isHealthBill", () => {
  it("accepts titles about health care", () => {
    expect(isHealthBill("Mental Health Access Act")).toBe(true);
    expect(isHealthBill("Health Equity and Accountability Act of 2026")).toBe(true);
    expect(isHealthBill("To lower prescription drug prices for seniors")).toBe(true);
    expect(isHealthBill("Andrew Kearse Accountability for Denial of Medical Care Act")).toBe(true);
  });

  it("matches plurals", () => {
    expect(isHealthBill("Protecting Patients and Hospitals Act")).toBe(true);
    expect(isHealthBill("Rural Physicians Workforce Act")).toBe(true);
  });

  it("does not match a term inside another word", () => {
    // "intergovernmental" contains "mental"; this was the bug that surfaced a
    // Department of Defense procurement bill as health legislation.
    expect(
      isHealthBill(
        "To modify the authority of Department of Defense for installation support services and intergovernmental support agreements",
      ),
    ).toBe(false);
    expect(isHealthBill("Fundamental Rights Act")).toBe(false);
    expect(isHealthBill("Environmental Review Act")).toBe(false);
  });

  it("rejects insurance bills that are not about health", () => {
    expect(isHealthBill("National Flood Insurance Program Reauthorization Act")).toBe(false);
    expect(isHealthBill("Crop Insurance Improvement Act")).toBe(false);
    expect(isHealthBill("Health Insurance Portability Act")).toBe(true);
  });

  it("handles empty and null titles", () => {
    expect(isHealthBill("")).toBe(false);
    expect(isHealthBill(null)).toBe(false);
    expect(isHealthBill(undefined)).toBe(false);
  });
});

describe("wordPattern", () => {
  it("escapes regex metacharacters in terms", () => {
    const p = wordPattern(["a.b", "(x)"]);
    expect(p.test("a.b notation")).toBe(true);
    expect(p.test("axb notation")).toBe(false);
  });
});
