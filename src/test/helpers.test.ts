import { describe, expect, it } from "vitest";
import { timeAgo } from "../lib/time";
import { ordinal, escapeHtml } from "../lib/format";
import { partyTone, repTitle, publicProfileUrl, type Representative } from "../lib/reps";

describe("timeAgo", () => {
  const now = 1_000_000_000_000;
  it("rounds to the nearest unit", () => {
    expect(timeAgo(now - 10_000, now)).toBe("just now");
    expect(timeAgo(now - 4 * 60_000, now)).toBe("4 min ago");
    expect(timeAgo(now - 3 * 3_600_000, now)).toBe("3 h ago");
    expect(timeAgo(now - 2 * 86_400_000, now)).toBe("2 d ago");
  });
  it("never goes negative", () => {
    expect(timeAgo(now + 60_000, now)).toBe("just now");
  });
});

describe("ordinal", () => {
  it("handles the teens and the rest", () => {
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
    expect(ordinal(11)).toBe("11th");
    expect(ordinal(112)).toBe("112th");
    expect(ordinal(119)).toBe("119th");
    expect(ordinal(121)).toBe("121st");
  });
});

describe("escapeHtml", () => {
  it("escapes the five characters that matter", () => {
    expect(escapeHtml(`<b onclick="x">Tom & "Jerry's"</b>`)).toBe(
      "&lt;b onclick=&quot;x&quot;&gt;Tom &amp; &quot;Jerry&#39;s&quot;&lt;/b&gt;",
    );
  });
});

describe("reps", () => {
  const house: Representative = {
    bioguideId: "M001143",
    name: "McCollum, Betty",
    party: "Democratic",
    state: "MN",
    district: 4,
    chamber: "House of Representatives",
    url: "https://api.congress.gov/v3/member/M001143",
    depiction: null,
  };
  const senate: Representative = { ...house, bioguideId: "K000367", name: "Klobuchar, Amy", district: null, chamber: "Senate" };

  it("maps parties to dot tones only", () => {
    expect(partyTone("Democratic")).toBe("info");
    expect(partyTone("Republican")).toBe("destructive");
    expect(partyTone("Independent")).toBe("neutral");
  });
  it("titles members by chamber", () => {
    expect(repTitle(house)).toBe("U.S. Representative, MN-4");
    expect(repTitle(senate)).toBe("U.S. Senator, Minnesota");
  });
  it("builds a browsable Congress.gov profile URL", () => {
    expect(publicProfileUrl(house)).toBe("https://www.congress.gov/member/mccollum-betty/M001143");
  });
});
