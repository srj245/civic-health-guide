import { createClient } from "npm:@supabase/supabase-js@2";
import {
  badRequest,
  fail,
  json,
  methodNotAllowed,
  preflight,
  rateLimit,
  readJsonObject,
} from "../_shared/http.ts";
import { parseEnum, parseText } from "../_shared/validate.ts";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const QUERY_MAX = 120;

interface PlaceResult {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: { openNow?: boolean };
  location?: { latitude?: number; longitude?: number };
  types?: string[];
}

const CATEGORIES = ["primary", "mental", "pharmacy", "specialty"] as const;
const categoryQueries: Record<(typeof CATEGORIES)[number], string> = {
  primary: "primary care clinic community health center",
  mental: "mental health counseling clinic",
  pharmacy: "pharmacy",
  specialty: "specialist medical clinic",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return methodNotAllowed();

  const limited = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    // Require a signed-in user (keeps the paid Maps search from being an open public proxy)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: userData } = token ? await supabase.auth.getUser(token) : { data: null };
    if (!userData?.user) {
      return json({ error: "Please sign in to search for care near you.", code: "auth_required" }, 401);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      return fail(500, "Care search is temporarily unavailable.", "Google Maps connector credentials missing");
    }

    const body = await readJsonObject(req);
    if (!body) return badRequest("Request body must be a JSON object.");

    const zipCode = parseText(body.zipCode, { max: QUERY_MAX, required: true });
    if (!zipCode) return badRequest("Please enter a ZIP code or city.");
    if (!/^[\w\s.,'-]+$/u.test(zipCode)) return badRequest("Please enter a ZIP code or city using letters and numbers only.");

    let category: (typeof CATEGORIES)[number] | null = null;
    if (body.category !== undefined && body.category !== null && body.category !== "") {
      category = parseEnum(body.category, CATEGORIES);
      if (!category) return badRequest("Unknown care category.");
    }
    const lowCostOnly = body.lowCostOnly === true;
    const includeTelehealth = body.includeTelehealth === true;

    let query = category ? categoryQueries[category] : "health clinic";
    if (lowCostOnly) query += " free low cost sliding scale";
    if (includeTelehealth) query += " telehealth";
    query += ` near ${zipCode}`;

    const response = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours.openNow,places.types",
      },
      body: JSON.stringify({ textQuery: query, pageSize: 10 }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      return fail(
        502,
        "We couldn't reach the care search service right now. Please try again shortly.",
        `Places request failed [${response.status}]: ${details}`,
      );
    }

    const data = await response.json();
    const results = ((data.places || []) as PlaceResult[]).map((p) => ({
      id: p.id,
      name: p.displayName?.text ?? "Unnamed location",
      address: p.formattedAddress ?? "",
      rating: p.rating ?? null,
      totalRatings: p.userRatingCount ?? 0,
      isOpen: p.currentOpeningHours?.openNow ?? null,
      lat: p.location?.latitude,
      lng: p.location?.longitude,
      types: p.types || [],
    }));

    return json({ results, query });
  } catch (error) {
    return fail(500, "Something went wrong while searching. Please try again.", error);
  }
});
