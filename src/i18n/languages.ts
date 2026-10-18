/**
 * Languages CivicCare speaks.
 *
 * `ui` languages have a complete interface translation. Every language in the
 * list can be chosen for generated content (bill summaries, impact results,
 * chat), which the AI functions produce in that language. The list leads with
 * the languages most spoken at home in Minnesota after English.
 */
export interface Language {
  code: string;
  /** Name in the language itself. */
  name: string;
  /** English name, for screen readers and logs. */
  english: string;
  ui: boolean;
  dir?: "rtl";
}

export const LANGUAGES: readonly Language[] = [
  { code: "en", name: "English", english: "English", ui: true },
  { code: "es", name: "Español", english: "Spanish", ui: true },
  { code: "so", name: "Soomaali", english: "Somali", ui: false },
  { code: "hmn", name: "Hmoob", english: "Hmong", ui: false },
  { code: "vi", name: "Tiếng Việt", english: "Vietnamese", ui: false },
  { code: "zh", name: "中文", english: "Chinese", ui: false },
  { code: "ar", name: "العربية", english: "Arabic", ui: false, dir: "rtl" },
  { code: "fr", name: "Français", english: "French", ui: false },
  { code: "ru", name: "Русский", english: "Russian", ui: false },
  { code: "am", name: "አማርኛ", english: "Amharic", ui: false },
  { code: "kar", name: "ကညီကျိာ်", english: "Karen", ui: false },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
export type UiLanguage = "en" | "es";

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const isLanguageCode = (v: unknown): v is LanguageCode =>
  typeof v === "string" && LANGUAGES.some((l) => l.code === v);

export const languageByCode = (code: string) => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

/** The interface language for a content language: Spanish stays Spanish, everything else reads English. */
export const uiLanguageFor = (code: LanguageCode): UiLanguage => (code === "es" ? "es" : "en");
