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
import { parseBillId, parseCongress, parseEnum, parseLimit } from "../_shared/validate.ts";

const CONGRESS_API_BASE = "https://api.congress.gov/v3";
const ACTIONS = ["recent-bills", "bill-details", "health-bills", "subjects"] as const;

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
          console.log("No summary available:", e instanceof Error ? e.message : e);
        }

        return json({ bill: { ...(detail.bill ?? {}), summary } });
      }

      case "health-bills": {
        const data = await congressFetch(`/bill/${congress}`, apiKey, {
          limit: "250",
          sort: "updateDate desc",
        });
        const seen = new Set<string>();
        const health: ReturnType<typeof slimBill>[] = [];
        for (const bill of (data.bills ?? []) as CongressBill[]) {
          if (health.length >= limit) break;
          if (!isHealthBill(bill.title)) continue;
          const slim = slimBill(bill);
          if (seen.has(slim.id)) continue;
          seen.add(slim.id);
          health.push(slim);
        }
        return json({ bills: health });
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
