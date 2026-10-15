/**
 * Where a bill sits in the legislative process, derived from Congress.gov's
 * latest-action text. Congress.gov does not expose a structured status field
 * on the list endpoint, so the stage is inferred from the wording of the action.
 */

export type BillStage = "introduced" | "committee" | "floor" | "other-chamber" | "president" | "law";

export const STAGES: { key: BillStage; label: string; short: string }[] = [
  { key: "introduced", label: "Introduced", short: "Intro" },
  { key: "committee", label: "In committee", short: "Comm." },
  { key: "floor", label: "Passed one chamber", short: "Passed" },
  { key: "other-chamber", label: "In the other chamber", short: "Other" },
  { key: "president", label: "To the President", short: "Pres." },
  { key: "law", label: "Became law", short: "Law" },
];

export const stageIndex = (stage: BillStage) => STAGES.findIndex((s) => s.key === stage);

/** Resolutions never go to the President; the last stage for them is "agreed to". */
export const isResolution = (type?: string) => /res$/i.test(type ?? "");

export function billStage(latestActionText?: string | null, type?: string): BillStage {
  const t = (latestActionText ?? "").toLowerCase();
  if (!t) return "introduced";

  if (/became public law|signed by (the )?president|public law no/.test(t)) return "law";
  if (/presented to (the )?president|cleared for white house|to the president/.test(t)) return "president";

  // Agreed-to resolutions are finished.
  if (isResolution(type) && /agreed to|resolution agreed/.test(t)) return "floor";

  // Passed one chamber and now sitting in the other.
  if (/received in the (senate|house)|held at the desk|placed on (the )?(senate|union|house) calendar/.test(t)) return "other-chamber";
  if (/passed (the )?(house|senate)|passed\/agreed to|on passage passed|motion to reconsider laid on the table/.test(t)) return "floor";

  if (/committee|subcommittee|hearings held|markup|reported by|ordered to be reported/.test(t)) return "committee";
  if (/introduced|read twice|read the first time|sponsor introductory remarks/.test(t)) return "introduced";

  return "committee";
}
