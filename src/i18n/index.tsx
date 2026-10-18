import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LANGUAGE, isLanguageCode, languageByCode, uiLanguageFor, type LanguageCode, type UiLanguage } from "./languages";
import { messages, type MessageKey } from "./messages";

const STORAGE_KEY = "civiccare-lang";

interface I18nValue {
  /** Content language: what summaries, results, and chat are generated in. */
  language: LanguageCode;
  /** Interface language: "en" or "es". */
  ui: UiLanguage;
  setLanguage: (code: LanguageCode) => void;
  /** Translate a message key, with {name} placeholders. */
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function readStored(): LanguageCode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (isLanguageCode(v)) return v;
  } catch {
    /* storage unavailable */
  }
  // First visit: follow the browser if it is a language we support.
  const nav = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "";
  const base = nav.split("-")[0];
  return isLanguageCode(base) ? base : DEFAULT_LANGUAGE;
}

export function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>(readStored);
  const ui = uiLanguageFor(language);

  useEffect(() => {
    const lang = languageByCode(language);
    document.documentElement.lang = language;
    document.documentElement.dir = lang.dir ?? "ltr";
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const table = messages[ui] as Record<string, string>;
      const fallback = messages.en as Record<string, string>;
      return interpolate(table[key] ?? fallback[key] ?? key, vars);
    },
    [ui],
  );

  const value = useMemo(() => ({ language, ui, setLanguage, t }), [language, ui, setLanguage, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Shorthand when a component only needs `t`. */
export const useT = () => useI18n().t;
