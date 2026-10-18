/** Shared types and helpers for congressional representative lookups. */

export interface Representative {
  bioguideId?: string | null;
  name: string;
  party: string;
  state: string;
  district: number | null;
  chamber: string;
  url: string;
  depiction: string | null;
  /** Official house.gov / senate.gov site, when known. */
  website?: string | null;
}

export interface DistrictLocation {
  zip: string;
  city: string | null;
  state: string;
  district: number | null;
  districtLabel: string;
}

export interface RepLookupResponse {
  members?: Representative[];
  location?: DistrictLocation;
  districtUnresolved?: boolean;
  error?: string;
}

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", DC: "Washington, D.C.", FL: "Florida", GA: "Georgia", HI: "Hawaii",
  ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", PR: "Puerto Rico", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

export const US_STATES = Object.keys(STATE_NAMES);

export const isSenator = (rep: Representative) => /senate/i.test(rep.chamber);

/** Chip dot tone for a party; the chip fill never changes. */
export const partyTone = (party: string): "info" | "destructive" | "neutral" => {
  const p = party?.toLowerCase() ?? "";
  if (p.includes("democrat")) return "info";
  if (p.includes("republican")) return "destructive";
  return "neutral";
};

export const partyShort = (party: string) => {
  const p = party?.toLowerCase() ?? "";
  if (p.includes("republican")) return "R";
  if (p.includes("democrat")) return "D";
  if (p.includes("independent")) return "I";
  return party;
};

/**
 * Minimal translator shape so these helpers can be localized from a component
 * (pass `useI18n().t`) while staying usable without React. English by default.
 */
export type RepTranslate = (key: string, vars?: Record<string, string | number>) => string;

const EN: Record<string, string> = {
  "reps.title.senator": "U.S. Senator, {state}",
  "reps.title.rep": "U.S. Representative, {state}-{district}",
  "reps.title.atLarge": "U.S. Representative, {state} at large",
  "reps.draft.senator": "Senator",
  "reps.draft.representative": "Representative",
  "reps.draft.aboutTopic": "about {topic}",
  "reps.draft.aboutDefault": "about health care in our community",
  "reps.draft.body":
    "Dear {honorific} {lastName},\n\nI am your constituent, and I am writing {subject}.\n\nAccess to affordable care matters to my family. I would like to know where you stand on current health legislation, and I urge you to support measures that protect health coverage, expand mental health services, and lower prescription drug costs.\n\nThank you for your time and for representing us.\n\nSincerely,\n[Your name]\n[Your city, {state}]",
};

const englishT: RepTranslate = (key, vars) =>
  (EN[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars ? String(vars[k]) : `{${k}}`));

export const repTitle = (rep: Representative, t: RepTranslate = englishT) =>
  isSenator(rep)
    ? t("reps.title.senator", { state: STATE_NAMES[rep.state] ?? rep.state })
    : rep.district
      ? t("reps.title.rep", { state: rep.state, district: rep.district })
      : t("reps.title.atLarge", { state: rep.state });

/**
 * Where to send a message: the member's official site (every office has a
 * contact form there), falling back to the Congress.gov profile.
 */
export const contactUrl = (rep: Representative) => rep.website || publicProfileUrl(rep);

/** Public Congress.gov profile page for a member (the API url is not browsable). */
export const publicProfileUrl = (rep: Representative) => {
  const id = rep.bioguideId ?? rep.url?.match(/member\/([A-Z]\d{6})/)?.[1];
  if (!id) return `https://www.congress.gov/search?q=${encodeURIComponent(rep.name)}`;
  const slug = rep.name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
  return `https://www.congress.gov/member/${slug}/${id}`;
};

/**
 * A draft constituents can paste into their representative's contact form.
 * Members of Congress do not publish email addresses; every office uses a web form,
 * which is why the UI copies the text instead of opening a blank mailto.
 */
export const draftMessage = (rep: Representative, topic?: string, t: RepTranslate = englishT) => {
  const honorific = isSenator(rep) ? t("reps.draft.senator") : t("reps.draft.representative");
  const lastName = rep.name.split(",")[0]?.trim() || rep.name;
  const subject = topic ? t("reps.draft.aboutTopic", { topic }) : t("reps.draft.aboutDefault");
  return t("reps.draft.body", { honorific, lastName, subject, state: rep.state });
};
