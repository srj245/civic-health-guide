/**
 * Input validation shared by the edge functions. Every helper returns either a
 * cleaned value or `null` when the input is unacceptable; callers turn `null`
 * into a 400 with a short plain message.
 */

/** Content languages the AI functions can write in. Keep in sync with src/i18n/languages.ts. */
export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  so: "Somali",
  hmn: "Hmong",
  vi: "Vietnamese",
  zh: "Simplified Chinese",
  ar: "Arabic",
  fr: "French",
  ru: "Russian",
  am: "Amharic",
  kar: "S'gaw Karen",
};

/** Returns a supported language code; anything else is English. */
export function parseLanguage(v: unknown): string {
  return typeof v === "string" && v in LANGUAGE_NAMES ? v : "en";
}

/** One sentence to append to a prompt so the model answers in the chosen language. */
export function languageInstruction(code: string): string {
  const name = LANGUAGE_NAMES[code] ?? "English";
  return code === "en"
    ? ""
    : ` Write every sentence of your answer in ${name}, at a plain reading level, keeping bill numbers, program names like Medicare, and proper nouns as they are.`;
}

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC", "PR",
  "GU", "VI", "AS", "MP",
] as const;

export const DEFAULT_CONGRESS = 119;
export const MIN_CONGRESS = 93;
export const MAX_CONGRESS = 130;

export const BILL_ID_RE = /^(hr|s|hres|sres|hjres|sjres|hconres|sconres)\d{1,5}$/i;
export const BIOGUIDE_RE = /^[A-Z]\d{6}$/;

function toInt(v: unknown): number | null {
  if (typeof v === "number") return Number.isInteger(v) ? v : null;
  if (typeof v === "string" && /^\d{1,6}$/.test(v.trim())) return parseInt(v.trim(), 10);
  return null;
}

/** Integer in [MIN_CONGRESS, MAX_CONGRESS]; undefined/null/"" -> default. */
export function parseCongress(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return DEFAULT_CONGRESS;
  const n = toInt(v);
  if (n === null || n < MIN_CONGRESS || n > MAX_CONGRESS) return null;
  return n;
}

/** Integer in [1, 250]; undefined/null/"" -> fallback. */
export function parseLimit(v: unknown, fallback = 10): number | null {
  if (v === undefined || v === null || v === "") return fallback;
  const n = toInt(v);
  if (n === null || n < 1 || n > 250) return null;
  return n;
}

/** "hr1234" -> { type: "hr", number: "1234" } */
export function parseBillId(v: unknown): { type: string; number: string; id: string } | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!BILL_ID_RE.test(s)) return null;
  const m = s.match(/^([a-z]+)(\d+)$/i)!;
  return { type: m[1].toLowerCase(), number: m[2], id: s.toLowerCase() };
}

export function parseBioguideId(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toUpperCase();
  return BIOGUIDE_RE.test(s) ? s : null;
}

export function parseState(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toUpperCase();
  return (US_STATES as readonly string[]).includes(s) ? s : null;
}

/**
 * Trims and caps a string. Returns "" for undefined/null when `required` is
 * false, and null when the value is missing/empty and required, or not a
 * string at all.
 */
export function parseText(
  v: unknown,
  { max, required = false }: { max: number; required?: boolean },
): string | null {
  if (v === undefined || v === null) return required ? null : "";
  if (typeof v !== "string") return null;
  // Strip control characters except newline/tab so prompts stay clean.
  // The control-character ranges are intentional: that is exactly what this regex removes.
  // eslint-disable-next-line no-control-regex
  const s = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (required && !s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

/** Picks a value from a whitelist (exact match after trim). */
export function parseEnum<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  if (typeof v !== "string") return null;
  const s = v.trim() as T;
  return allowed.includes(s) ? s : null;
}
