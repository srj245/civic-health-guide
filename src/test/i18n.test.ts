import { describe, expect, it } from "vitest";
import { interpolate } from "../i18n";
import { messages } from "../i18n/messages";
import { LANGUAGES, isLanguageCode, uiLanguageFor } from "../i18n/languages";

describe("i18n", () => {
  it("interpolates placeholders and leaves unknown ones visible", () => {
    expect(interpolate("Updated {when}", { when: "just now" })).toBe("Updated just now");
    expect(interpolate("{n} results", { n: 3 })).toBe("3 results");
    expect(interpolate("Hello {name}", {})).toBe("Hello {name}");
  });

  it("has a Spanish string for every English key", () => {
    const en = Object.keys(messages.en);
    const missing = en.filter((k) => !(k in messages.es));
    expect(missing).toEqual([]);
    const extra = Object.keys(messages.es).filter((k) => !(k in messages.en));
    expect(extra).toEqual([]);
  });

  it("never ships an empty translation", () => {
    for (const lang of ["en", "es"] as const) {
      for (const [k, v] of Object.entries(messages[lang])) {
        expect(v.trim().length, `${lang}.${k}`).toBeGreaterThan(0);
      }
    }
  });

  it("knows its languages", () => {
    expect(isLanguageCode("so")).toBe(true);
    expect(isLanguageCode("klingon")).toBe(false);
    expect(uiLanguageFor("es")).toBe("es");
    expect(uiLanguageFor("hmn")).toBe("en");
    expect(LANGUAGES.filter((l) => l.ui).map((l) => l.code)).toEqual(["en", "es"]);
  });
});
