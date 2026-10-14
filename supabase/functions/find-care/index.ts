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

/**
 * find-care
 *
 * The user's ZIP or city is geocoded FIRST, then Places is searched inside a
 * bounding box around that point. Appending "near 55016" to a free-text query
 * let Google pick a different metro whenever the ZIP was ambiguous, which is
 * why results used to come back from the wrong place.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const QUERY_MAX = 120;
const RADIUS_KM = 25;

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

interface Point {
  lat: number;
  lng: number;
  label: string;
}

const CATEGORIES = ["primary", "mental", "pharmacy", "specialty"] as const;
const categoryQueries: Record<(typeof CATEGORIES)[number], string> = {
  primary: "primary care clinic community health center",
  mental: "mental health counseling clinic",
  pharmacy: "pharmacy",
  specialty: "specialist medical clinic",
};

const placesHeaders = (lovableKey: string, mapsKey: string, fieldMask: string) => ({
  Authorization: `Bearer ${lovableKey}`,
  "X-Connection-Api-Key": mapsKey,
  "Content-Type": "application/json",
  "X-Goog-FieldMask": fieldMask,
});

/** 5-digit US ZIP -> centroid via zippopotam.us (keyless). */
async function geocodeZip(zip: string): Promise<Point | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const place = data?.places?.[0];
    if (!place) return null;
    return {
      lat: Number(place.latitude),
      lng: Number(place.longitude),
      label: `${place["place name"]}, ${place["state abbreviation"]} ${zip}`,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Free text (city, "city, state", address) -> point via Places text search. */
async function geocodeText(text: string, lovableKey: string, mapsKey: string): Promise<Point | null> {
  const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
    method: "POST",
    headers: placesHeaders(lovableKey, mapsKey, "places.formattedAddress,places.location,places.types"),
    body: JSON.stringify({ textQuery: `${text}, United States`, pageSize: 1, languageCode: "en" }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const p = (data.places || [])[0] as PlaceResult | undefined;
  if (!p?.location?.latitude || !p.location.longitude) return null;
  return { lat: p.location.latitude, lng: p.location.longitude, label: p.formattedAddress ?? text };
}

function boundingBox(center: Point, km: number) {
  const dLat = km / 111;
  const dLng = km / (111 * Math.max(0.2, Math.cos((center.lat * Math.PI) / 180)));
  return {
    low: { latitude: center.lat - dLat, longitude: center.lng - dLng },
    high: { latitude: center.lat + dLat, longitude: center.lng + dLng },
  };
}

function distanceKm(a: Point, lat: number, lng: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat - a.lat);
  const dLng = toRad(lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

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

    // 1. Resolve the location.
    const zipMatch = zipCode.match(/^\s*(\d{5})(?:-\d{4})?\s*$/);
    let center: Point | null = null;
    if (zipMatch) center = await geocodeZip(zipMatch[1]);
    if (!center) center = await geocodeText(zipCode, LOVABLE_API_KEY, GOOGLE_MAPS_API_KEY);
    if (!center) {
      return json({ error: `We couldn't find "${zipCode}". Try a 5-digit ZIP code or "City, State".` }, 404);
    }

    // 2. Search only inside a box around that point.
    let query = category ? categoryQueries[category] : "health clinic";
    if (lowCostOnly) query += " free low cost sliding scale";
    if (includeTelehealth) query += " telehealth";

    const response = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
      method: "POST",
      headers: placesHeaders(
        LOVABLE_API_KEY,
        GOOGLE_MAPS_API_KEY,
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours.openNow,places.types",
      ),
      body: JSON.stringify({
        textQuery: query,
        pageSize: 15,
        languageCode: "en",
        locationRestriction: { rectangle: boundingBox(center, RADIUS_KM) },
      }),
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
    const results = ((data.places || []) as PlaceResult[])
      .filter((p) => p.location?.latitude != null && p.location?.longitude != null)
      .map((p) => {
        const lat = p.location!.latitude!;
        const lng = p.location!.longitude!;
        return {
          id: p.id,
          name: p.displayName?.text ?? "Unnamed location",
          address: p.formattedAddress ?? "",
          rating: p.rating ?? null,
          totalRatings: p.userRatingCount ?? 0,
          isOpen: p.currentOpeningHours?.openNow ?? null,
          lat,
          lng,
          types: p.types || [],
          distanceKm: Math.round(distanceKm(center!, lat, lng) * 10) / 10,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 10);

    return json({ results, query, location: center });
  } catch (error) {
    return fail(500, "Something went wrong while searching. Please try again.", error);
  }
});
