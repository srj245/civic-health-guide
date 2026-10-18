/**
 * Interface strings. Each namespace file exports `{ en, es }` with identical
 * keys; this file merges them. One namespace per feature area so people can
 * work on different areas without conflicts.
 */
import { common } from "./common";
import { home } from "./home";
import { bills } from "./bills";
import { care } from "./care";
import { impact } from "./impact";
import { reps } from "./reps";
import { account } from "./account";

type Namespace = { en: Record<string, string>; es: Record<string, string> };

const namespaces: Namespace[] = [common, home, bills, care, impact, reps, account];

const merge = (lang: "en" | "es") => Object.assign({}, ...namespaces.map((n) => n[lang])) as Record<string, string>;

export const messages = { en: merge("en"), es: merge("es") };

export type MessageKey =
  | keyof typeof common.en
  | keyof typeof home.en
  | keyof typeof bills.en
  | keyof typeof care.en
  | keyof typeof impact.en
  | keyof typeof reps.en
  | keyof typeof account.en;
