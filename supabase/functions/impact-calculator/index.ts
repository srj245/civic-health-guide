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
import { DEFAULT_CONGRESS, languageInstruction, parseEnum, parseLanguage, parseState, parseText } from "../_shared/validate.ts";

/**
 * Grounded impact calculator.
 *
 * 1. Pull the 250 most recently updated bills of the current Congress.
 * 2. Keep only the ones the shared health filter accepts (max 25).
 * 3. Give the model a numbered list with ids and tell it to choose ONLY from
 *    that list, returning ids.
 * 4. Drop any id the model returns that was not in the list, and attach the
 *    official title / latest action as `sources` so the UI can show the real
 *    record next to the AI text.
 */

const AGE_RANGES = ["18–26", "27–44", "45–64", "65+"] as const;
const INSURANCE_TYPES = ["Employer", "Marketplace (ACA)", "Medicare", "Medicaid", "Uninsured", "Other"] as const;
const MAX_CONCERNS = 8;
const CONCERN_MAX_LEN = 60;
const MAX_CANDIDATES = 25;
const MAX_RESULTS = 6;

interface CongressBill {
  type?: string;
  number?: string | number;
  congress?: number;
  title?: string;
  latestAction?: { text?: string; actionDate?: string };
  updateDate?: string;
  url?: string;
}

interface Source {
  id: string;
  title: string;
  congress: number;
  type: string;
  number: string;
  latestAction: string | null;
  latestActionDate: string | null;
  updateDate: string | null;
  url: string | null;
}

const BILL_SLUGS: Record<string, string> = {
  hr: "house-bill",
  s: "senate-bill",
  hres: "house-resolution",
  sres: "senate-resolution",
  hjres: "house-joint-resolution",
  sjres: "senate-joint-resolution",
  hconres: "house-concurrent-resolution",
  sconres: "senate-concurrent-resolution",
};

/** Human-readable Congress.gov page for a bill (the API `url` is a JSON endpoint). */
function congressGovUrl(congress: number, type: string, number: string): string | null {
  const slug = BILL_SLUGS[type.toLowerCase()];
  if (!slug || !number) return null;
  return `https://www.congress.gov/bill/${congress}th-congress/${slug}/${number}`;
}

async function fetchHealthBills(apiKey: string): Promise<Source[]> {
  const url = new URL(`https://api.congress.gov/v3/bill/${DEFAULT_CONGRESS}`);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "250");
  url.searchParams.set("sort", "updateDate desc");
  url.searchParams.set("api_key", apiKey);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Congress API responded ${res.status}`);
  const data = await res.json();

  const out: Source[] = [];
  const seen = new Set<string>();
  for (const b of (data.bills ?? []) as CongressBill[]) {
    if (out.length >= MAX_CANDIDATES) break;
    if (!isHealthBill(b.title)) continue;
    const id = `${b.type ?? ""}${b.number ?? ""}`.toLowerCase();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      title: b.title ?? "",
      congress: b.congress ?? DEFAULT_CONGRESS,
      type: String(b.type ?? "").toUpperCase(),
      number: String(b.number ?? ""),
      latestAction: b.latestAction?.text ?? null,
      latestActionDate: b.latestAction?.actionDate ?? null,
      updateDate: b.updateDate ?? null,
      url: congressGovUrl(b.congress ?? DEFAULT_CONGRESS, String(b.type ?? ""), String(b.number ?? "")),
    });
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return methodNotAllowed();

  const limited = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const CONGRESS_API_KEY = Deno.env.get("CONGRESS_API_KEY");
    if (!LOVABLE_API_KEY || !CONGRESS_API_KEY) {
      return fail(500, "The impact calculator is temporarily unavailable.", "LOVABLE_API_KEY or CONGRESS_API_KEY missing");
    }

    const body = await readJsonObject(req);
    if (!body) return badRequest("Request body must be a JSON object.");

    const ageRange = parseEnum(body.ageRange, AGE_RANGES);
    if (!ageRange) return badRequest("Please choose a valid age range.");
    const insuranceType = parseEnum(body.insuranceType, INSURANCE_TYPES);
    if (!insuranceType) return badRequest("Please choose a valid insurance type.");
    const state = parseState(body.state);
    if (!state) return badRequest("Please choose a valid state.");

    if (!Array.isArray(body.concerns) || body.concerns.length === 0 || body.concerns.length > MAX_CONCERNS) {
      return badRequest(`concerns must be a list of 1 to ${MAX_CONCERNS} items.`);
    }
    const concerns: string[] = [];
    for (const c of body.concerns) {
      const text = parseText(c, { max: CONCERN_MAX_LEN, required: true });
      if (!text) return badRequest("Each concern must be a short piece of text.");
      concerns.push(text);
    }

    const candidates = await fetchHealthBills(CONGRESS_API_KEY);
    if (candidates.length === 0) {
      return json({ results: [], sources: [], congress: DEFAULT_CONGRESS });
    }

    const list = candidates
      .map((b, i) =>
        `${i + 1}. id="${b.id}" ${b.type}${b.number}: "${b.title}"` +
        (b.latestAction ? ` (Latest action: ${b.latestAction})` : ""),
      )
      .join("\n");

    const prompt = `A user has the following profile:
- Age range: ${ageRange}
- Insurance type: ${insuranceType}
- Health concerns: ${concerns.join(", ")}
- State: ${state}

Below is the complete list of bills you may discuss. Each line has an id in quotes.

${list}

Rules:
- Choose ONLY bills from the list above. Do not mention, invent, or recall any bill that is not in the list.
- Return the exact id string for each bill you choose, copied from the list.
- Pick at most ${MAX_RESULTS} bills that are genuinely relevant to this profile. If few or none are relevant, return fewer (an empty list is acceptable).
- Base the impact explanation only on the title and latest action shown; if the title alone is not enough to be confident, say the impact is uncertain.
- Be nonpartisan and factual.${languageInstruction(parseLanguage(body.language))}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a nonpartisan health policy analyst. You only discuss bills that appear in the list the user provides, identified by their ids.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_impact_results",
              description: "Return the chosen bill ids with a personal impact explanation for each",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        billId: { type: "string", description: "The id copied exactly from the list" },
                        impact: { type: "string", description: "2-3 sentence explanation of how this bill could affect the user" },
                        relevance: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["billId", "impact", "relevance"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["results"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_impact_results" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return json({ error: "Rate limited. Please try again in a moment." }, 429);
      if (response.status === 402) return json({ error: "AI credits exhausted. Please try again later." }, 402);
      const text = await response.text().catch(() => "");
      return fail(502, "The analysis service is unavailable right now.", `AI gateway ${response.status}: ${text}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let raw: Array<{ billId?: unknown; impact?: unknown; relevance?: unknown }> = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        if (Array.isArray(parsed?.results)) raw = parsed.results;
      } catch (e) {
        console.error("Failed to parse tool call:", e);
      }
    }

    // Ground the output: keep only ids that were in the candidate list, once each.
    const byId = new Map(candidates.map((c) => [c.id, c]));
    const usedIds = new Set<string>();
    const results: Array<{ billId: string; billTitle: string; impact: string; relevance: "high" | "medium" | "low" }> = [];
    for (const r of raw) {
      const id = typeof r.billId === "string" ? r.billId.trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "";
      const source = byId.get(id);
      if (!source || usedIds.has(id)) continue;
      const relevance = r.relevance === "high" || r.relevance === "medium" || r.relevance === "low" ? r.relevance : "low";
      const impact = typeof r.impact === "string" ? r.impact.trim().slice(0, 1200) : "";
      if (!impact) continue;
      usedIds.add(id);
      results.push({ billId: id, billTitle: source.title, impact, relevance });
      if (results.length >= MAX_RESULTS) break;
    }

    const order = { high: 0, medium: 1, low: 2 } as const;
    results.sort((a, b) => order[a.relevance] - order[b.relevance]);

    const sources = results.map((r) => byId.get(r.billId)!);

    return json({ results, sources, congress: DEFAULT_CONGRESS, candidateCount: candidates.length });
  } catch (error) {
    return fail(500, "Could not calculate your impact right now. Please try again.", error);
  }
});
