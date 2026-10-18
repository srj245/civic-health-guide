import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_LANGUAGE, isLanguageCode, languageByCode, uiLanguageFor, type LanguageCode, type UiLanguage } from "./languages";
import { messages, type MessageKey } from "./messages";

const STORAGE_KEY = "civiccare-lang";
const TABLE_KEY = (lang: string, version: string) => `civiccare-ui-${lang}-${version}`;

interface I18nValue {
  /** Content language: what summaries, results, chat, and the interface are shown in. */
  language: LanguageCode;
  /** Locale family for dates and numbers: "es" for Spanish, "en" otherwise. */
  ui: UiLanguage;
  /** True while a machine-translated interface is loading; English shows meanwhile. */
  translating: boolean;
  /** True when the interface strings came from the translation function rather than a person. */
  machineTranslated: boolean;
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

/** Short stable hash of the English table, so cached translations expire when strings change. */
export function tableVersion(table: Record<string, string>): string {
  let h = 2166136261;
  for (const [k, v] of Object.entries(table)) {
    for (const ch of `${k}=${v};`) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619) >>> 0;
    }
  }
  return h.toString(36);
}

const EN_VERSION = tableVersion(messages.en);

function readCachedTable(lang: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(TABLE_KEY(lang, EN_VERSION));
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

async function fetchTranslatedTable(lang: string): Promise<Record<string, string> | null> {
  const { data, error } = await supabase.functions.invoke<{ strings?: Record<string, string>; error?: string }>("translate-ui", {
    body: { language: lang, version: EN_VERSION, strings: messages.en },
  });
  if (error || !data?.strings) return null;
  try {
    localStorage.setItem(TABLE_KEY(lang, EN_VERSION), JSON.stringify(data.strings));
  } catch {
    /* storage full or unavailable */
  }
  return data.strings;
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>(readStored);
  const [dynamic, setDynamic] = useState<Record<string, string> | null>(() =>
    language === "en" || language === "es" ? null : readCachedTable(language),
  );
  const [translating, setTranslating] = useState(false);
  const ui = uiLanguageFor(language);
  const needsMachine = language !== "en" && language !== "es";

  useEffect(() => {
    const lang = languageByCode(language);
    document.documentElement.lang = language;
    document.documentElement.dir = lang.dir ?? "ltr";
  }, [language]);

  // Load (or reuse) the machine-translated table for languages without a hand-written one.
  useEffect(() => {
    if (!needsMachine) {
      setDynamic(null);
      setTranslating(false);
      return;
    }
    const cached = readCachedTable(language);
    if (cached) {
      setDynamic(cached);
      setTranslating(false);
      return;
    }
    let cancelled = false;
    setDynamic(null);
    setTranslating(true);
    fetchTranslatedTable(language).then((table) => {
      if (cancelled) return;
      setDynamic(table);
      setTranslating(false);
    });
    return () => {
      cancelled = true;
    };
  }, [language, needsMachine]);

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
      const fallback = messages.en as Record<string, string>;
      const table = dynamic ?? (messages[ui] as Record<string, string>);
      return interpolate(table[key] ?? fallback[key] ?? key, vars);
    },
    [ui, dynamic],
  );

  const value = useMemo(
    () => ({ language, ui, translating, machineTranslated: Boolean(dynamic), setLanguage, t }),
    [language, ui, translating, dynamic, setLanguage, t],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Shorthand when a component only needs `t`. */
export const useT = () => useI18n().t;
