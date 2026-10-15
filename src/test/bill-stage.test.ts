import { describe, expect, it } from "vitest";
import { billStage, isResolution } from "../lib/bill-stage";

describe("billStage", () => {
  it("reads introduction and committee referral", () => {
    expect(billStage("Introduced in House")).toBe("introduced");
    expect(billStage("Read twice and referred to the Committee on Finance.")).toBe("committee");
    expect(billStage("Referred to the House Committee on Energy and Commerce.")).toBe("committee");
    expect(billStage("Ordered to be Reported by the Yeas and Nays: 30 - 12.")).toBe("committee");
  });

  it("reads floor passage and the other chamber", () => {
    expect(billStage("On passage Passed by the Yeas and Nays: 220 - 211.")).toBe("floor");
    expect(billStage("Passed Senate with an amendment by Unanimous Consent.")).toBe("floor");
    expect(billStage("Received in the Senate and Read twice and referred to the Committee on Finance.")).toBe("other-chamber");
    expect(billStage("Held at the desk.")).toBe("other-chamber");
  });

  it("reads the president and law", () => {
    expect(billStage("Presented to President.")).toBe("president");
    expect(billStage("Became Public Law No: 119-21.")).toBe("law");
    expect(billStage("Signed by President.")).toBe("law");
  });

  it("treats an agreed-to resolution as finished", () => {
    expect(billStage("Resolution agreed to in Senate without amendment by Unanimous Consent.", "sres")).toBe("floor");
    expect(isResolution("hres")).toBe(true);
    expect(isResolution("hr")).toBe(false);
  });

  it("defaults sensibly", () => {
    expect(billStage(undefined)).toBe("introduced");
    expect(billStage("Motion to proceed to consideration of measure made in Senate.")).toBe("committee");
  });
});
