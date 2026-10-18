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
import { parseBillId, parseCongress, parseEnum, parseLimit, parseText } from "../_shared/validate.ts";

const CONGRESS_API_BASE = "https://api.congress.gov/v3";
const ACTIONS = ["recent-bills", "bill-details", "health-bills", "search-bills", "subjects"] as const;

interface CongressBill {
  type?: string;
  number?: string | number;
  congress?: number;
  title?: string;
  latestAction?: unknown;
  updateDate?: string;
  url?: string;
  policyArea?: { name?: string };
}

function slimBill(bill: CongressBill) {
  return {
    id: `${bill.type ?? ""}${bill.number ?? ""}`,
    congress: bill.congress,
    type: bill.type,
    number: bill.number,
    title: bill.title,
    latestAction: bill.latestAction,
    updateDate: bill.updateDate,
    url: bill.url,
  };
}

const HEALTH_PAGES = 8; // 8 x 250 = the 2,000 most recently updated bills
const HEALTH_TTL_MS = 15 * 60 * 1000;
const healthCache = new Map<number, { at: number; bills: ReturnType<typeof slimBill>[] }>();
// The full recent list (not just the health subset), for free-text search.
const recentCache = new Map<number, { at: number; bills: ReturnType<typeof slimBill>[] }>();

async function getHealthBills(congress: number, apiKey: string) {
  const cached = healthCache.get(congress);
  if (cached && Date.now() - cached.at < HEALTH_TTL_MS) return cached.bills;

  const pages = await Promise.all(
    Array.from({ length: HEALTH_PAGES }, (_, i) =>
      congressFetch(`/bill/${congress}`, apiKey, {
        limit: "250",
        offset: String(i * 250),
        sort: "updateDate desc",
      }).catch(() => ({ bills: [] })),
    ),
  );
  const seen = new Set<string>();
  const all: ReturnType<typeof slimBill>[] = [];
  const health: ReturnType<typeof slimBill>[] = [];
  for (const page of pages) {
    for (const bill of (page.bills ?? []) as CongressBill[]) {
      const slim = slimBill(bill);
      if (seen.has(slim.id)) continue;
      seen.add(slim.id);
      all.push(slim);
      if (isHealthBill(bill.title)) health.push(slim);
    }
  }
  if (all.length > 0) recentCache.set(congress, { at: Date.now(), bills: all });
  if (health.length > 0) healthCache.set(congress, { at: Date.now(), bills: health });
  return health;
}

/** Whole-word search over the 2,000 most recently updated bills. */
async function searchBills(congress: number, apiKey: string, q: string) {
  const cached = recentCache.get(congress);
  if (!cached || Date.now() - cached.at >= HEALTH_TTL_MS) await getHealthBills(congress, apiKey);
  const all = recentCache.get(congress)?.bills ?? [];
  const words = q.split(/\s+/).filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (words.length === 0) return [];
  const patterns = words.map((w) => new RegExp(`\\b${w}`, "i"));
  const code = q.replace(/[\s.]/g, "").toLowerCase();
  return all
    .filter((b) => (b.title && patterns.every((p) => p.test(b.title!))) || (code.length >= 2 && b.id.toLowerCase() === code))
    .slice(0, 30);
}

async function congressFetch(path: string, apiKey: string, params: Record<string, string> = {}) {
  const url = new URL(`${CONGRESS_API_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Congress API responded ${res.status} for ${path}`);
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return methodNotAllowed();

  const limited = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const apiKey = Deno.env.get("CONGRESS_API_KEY");
    if (!apiKey) return fail(500, "Bill data is temporarily unavailable.", "CONGRESS_API_KEY missing");

    const body = await readJsonObject(req);
    if (!body) return badRequest("Request body must be a JSON object.");

    const action = body.action === undefined ? "recent-bills" : parseEnum(body.action, ACTIONS);
    if (!action) return badRequest("Unknown action.");

    const congress = parseCongress(body.congress);
    if (congress === null) return badRequest("congress must be a whole number between 93 and 130.");

    const limit = parseLimit(body.limit, 10);
    if (limit === null) return badRequest("limit must be a whole number between 1 and 250.");

    switch (action) {
      case "recent-bills": {
        const data = await congressFetch(`/bill/${congress}`, apiKey, {
          limit: String(limit),
          sort: "updateDate desc",
        });
        const bills: CongressBill[] = data.bills ?? [];
        return json({ bills: bills.map(slimBill) });
      }

      case "bill-details": {
        const bill = parseBillId(body.billId);
        if (!bill) return badRequest("billId must look like hr1234 or s567.");

        const detail = await congressFetch(`/bill/${congress}/${bill.type}/${bill.number}`, apiKey);

        let summary: string | null = null;
        try {
          const summaries = await congressFetch(
            `/bill/${congress}/${bill.type}/${bill.number}/summaries`,
            apiKey,
          );
          summary = summaries.summaries?.[0]?.text ?? null;
        } catch (e) {
          void e; // a bill without a summary is normal
        }

        return json({ bill: { ...(detail.bill ?? {}), summary } });
      }

      case "health-bills": {
        // Congress.gov returns at most 250 bills per page. Health bills are a
        // small share of recent activity, so we page through up to 1,000 and
        // cache the filtered list per isolate for 15 minutes.
        const bills = await getHealthBills(congress, apiKey);
        return json({ bills: bills.slice(0, limit), total: bills.length, fetchedAt: healthCache.get(congress)?.at ?? Date.now() });
      }

      case "search-bills": {
        const q = parseText(body.q, { max: 80, required: true });
        if (!q) return badRequest("Enter at least one word to search.");
        const bills = await searchBills(congress, apiKey, q);
        return json({ bills, q });
      }

      case "subjects": {
        const data = await congressFetch(`/bill/${congress}`, apiKey, {
          limit: "50",
          sort: "updateDate desc",
        });
        const areas = new Set<string>();
        for (const bill of (data.bills ?? []) as CongressBill[]) {
          if (bill.policyArea?.name) areas.add(bill.policyArea.name);
        }
        return json({ subjects: Array.from(areas) });
      }
    }
  } catch (error) {
    return fail(500, "Could not load bill data right now. Please try again.", error);
  }
});
