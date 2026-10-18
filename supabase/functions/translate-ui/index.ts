import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { LANGUAGE_NAMES, parseLanguage } from "../_shared/validate.ts";
import { badRequest, fail, json, methodNotAllowed, preflight, rateLimit, readJsonObject } from "../_shared/http.ts";

/**
 * translate-ui
 *
 * POST { language: "vi", version: "<hash>", strings: { key: englishText, ... } }
 * -> { language, version, strings: { key: translatedText, ... } }
 *
 * Translates CivicCare's interface strings into one of the supported
 * languages. English and Spanish are hand-written on the client and never
 * sent here. Results are cached per language and version in this isolate so
 * the model runs about once per language per deploy, not per visitor.
 * Placeholders like {name} are preserved verbatim.
 */

const MAX_KEYS = 700;
const MAX_VALUE = 600;
const BATCH = 60;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const cache = new Map<string, { at: number; strings: Record<string, string> }>();

function cleanStrings(v: unknown): Record<string, string> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out: Record<string, string> = {};
  let n = 0;
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof k !== "string" || typeof val !== "string") return null;
    if (k.length > 80 || val.length > MAX_VALUE) return null;
    out[k] = val;
    if (++n > MAX_KEYS) return null;
  }
  return n > 0 ? out : null;
}

async function translateBatch(entries: [string, string][], languageName: string, apiKey: string): Promise<Record<string, string>> {
  const source = Object.fromEntries(entries);
  const prompt = `Translate the values of this JSON object from English into ${languageName} for a civic website that explains health legislation in the United States.
Rules:
- Return ONLY a JSON object with exactly the same keys. No commentary.
- Keep placeholders such as {name}, {n}, {year}, {total} exactly as written.
- Keep proper nouns and program names (CivicCare, Congress.gov, Medicare, Medicaid, MNsure, WIC, 988) unchanged.
- Use plain, respectful wording at an everyday reading level. Sentence case. Keep punctuation like "…" and "·".
- If a value is a short button label, keep the translation short.

${JSON.stringify(source)}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(`gateway ${res.status}: ${await res.text().catch(() => "")}`);
  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text.replace(/^```json\s*|```$/g, "").trim());
  const out: Record<string, string> = {};
  for (const [k, v] of entries) {
    const t = parsed?.[k];
    out[k] = typeof t === "string" && t.trim() ? t : v; // fall back to English per key
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return methodNotAllowed();

  const limited = rateLimit(req, { limit: 12, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return fail(500, "Translation is temporarily unavailable.", "LOVABLE_API_KEY missing");

    const body = await readJsonObject(req);
    if (!body) return badRequest("Request body must be a JSON object.");

    const language = parseLanguage(body.language);
    if (language === "en" || language === "es") return badRequest("English and Spanish are built in.");
    const version = typeof body.version === "string" && /^[\w.-]{1,40}$/.test(body.version) ? body.version : "0";
    const strings = cleanStrings(body.strings);
    if (!strings) return badRequest("strings must be an object of short English texts.");

    const cacheKey = `${language}:${version}`;
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return json({ language, version, strings: hit.strings, cached: true });

    const entries = Object.entries(strings);
    const batches: [string, string][][] = [];
    for (let i = 0; i < entries.length; i += BATCH) batches.push(entries.slice(i, i + BATCH));
    const results = await Promise.all(batches.map((b) => translateBatch(b, LANGUAGE_NAMES[language], apiKey)));
    const translated = Object.assign({}, ...results) as Record<string, string>;

    cache.set(cacheKey, { at: Date.now(), strings: translated });
    return json({ language, version, strings: translated, cached: false });
  } catch (error) {
    return fail(502, "Translation is temporarily unavailable. Showing English.", error);
  }
});
