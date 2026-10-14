import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { isHealthBill } from "../_shared/health-filter.ts";
import {
  badRequest,
  fail,
  json,
  methodNotAllowed,
  preflight,
  rateLimit,
  readJsonObject,
} from "../_shared/http.ts";
import { DEFAULT_CONGRESS, parseBioguideId } from "../_shared/validate.ts";

/**
 * Counts the health-related bills a member has sponsored / cosponsored in the
 * current Congress. This is NOT voting data and NOT a score: it is a plain
 * count of bills whose title matches the shared health keyword filter.
 */

const CURRENT_CONGRESS = DEFAULT_CONGRESS;
const SAMPLE_SIZE = 25;

interface MemberBill {
  title?: string;
  type?: string;
  number?: string | number;
  congress?: number;
  url?: string;
  introducedDate?: string;
  latestAction?: { text?: string; actionDate?: string };
}

async function fetchLegislation(
  bioguideId: string,
  kind: "sponsored-legislation" | "cosponsored-legislation",
  apiKey: string,
): Promise<MemberBill[]> {
  const url = new URL(`https://api.congress.gov/v3/member/${bioguideId}/${kind}`);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "250");
  url.searchParams.set("api_key", apiKey);
  const res = await fetch(url.toString());
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Congress API responded ${res.status} for ${kind}`);
  const data = await res.json();
  const key = kind === "sponsored-legislation" ? "sponsoredLegislation" : "cosponsoredLegislation";
  return (data[key] ?? []) as MemberBill[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return methodNotAllowed();

  const limited = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const apiKey = Deno.env.get("CONGRESS_API_KEY");
    if (!apiKey) return fail(500, "Representative data is temporarily unavailable.", "CONGRESS_API_KEY missing");

    const body = await readJsonObject(req);
    if (!body) return badRequest("Request body must be a JSON object.");

    const bioguideId = parseBioguideId(body.bioguideId);
    if (!bioguideId) return badRequest("bioguideId must be a letter followed by six digits (e.g. A000360).");

    const [sponsored, cosponsored] = await Promise.all([
      fetchLegislation(bioguideId, "sponsored-legislation", apiKey),
      fetchLegislation(bioguideId, "cosponsored-legislation", apiKey),
    ]);

    // Congress.gov has no server-side congress filter on these member
    // endpoints, so scope by the `congress` field on each item.
    const inCurrent = (b: MemberBill) => b.congress === CURRENT_CONGRESS;
    const healthSponsored = sponsored.filter(inCurrent).filter((b) => isHealthBill(b.title));
    const healthCosponsored = cosponsored.filter(inCurrent).filter((b) => isHealthBill(b.title));

    const toSample = (b: MemberBill, role: "sponsor" | "cosponsor") => ({
      title: b.title ?? "",
      type: b.type ?? "",
      number: Number(b.number) || 0,
      congress: b.congress ?? CURRENT_CONGRESS,
      role,
      introducedDate: b.introducedDate ?? null,
      latestAction: b.latestAction?.text ?? null,
      url: b.url ?? null,
    });

    const sample = [
      ...healthSponsored.map((b) => toSample(b, "sponsor")),
      ...healthCosponsored.map((b) => toSample(b, "cosponsor")),
    ].slice(0, SAMPLE_SIZE);

    return json({
      bioguideId,
      congress: CURRENT_CONGRESS,
      sponsoredHealthBills: healthSponsored.length,
      cosponsoredHealthBills: healthCosponsored.length,
      sample,
      // The member endpoints page at 250; if either list hit the page size the
      // count may be a lower bound.
      truncated: sponsored.length >= 250 || cosponsored.length >= 250,
    });
  } catch (error) {
    return fail(500, "Could not load this representative's bills right now.", error);
  }
});
