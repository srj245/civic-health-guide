import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * find-representatives
 *
 * POST { zip: "30309" }   -> resolves the ZIP to a congressional district and
 *                            returns that district's House member plus both senators.
 * POST { state: "GA" }    -> returns every current member for the state.
 *
 * ZIP resolution is two public, keyless lookups:
 *   1. api.zippopotam.us gives the ZIP centroid (lat/lng) and state.
 *   2. The U.S. Census geocoder maps that point to the current congressional district.
 * Members then come from the Congress.gov API, filtered by district.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CONGRESS_API_BASE = 'https://api.congress.gov/v3';

const STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA',
  'MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','PR','RI','SC','SD','TN',
  'TX','UT','VT','VA','WA','WV','WI','WY','AS','GU','MP','VI',
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

interface CongressMember {
  bioguideId?: string;
  name: string;
  partyName: string;
  state: string;
  district?: number;
  terms?: { item?: { chamber?: string }[] };
  url: string;
  depiction?: { imageUrl?: string };
}

interface Member {
  bioguideId: string | null;
  name: string;
  party: string;
  state: string;
  district: number | null;
  chamber: string;
  url: string;
  depiction: string | null;
  /** The member's official house.gov / senate.gov site, where the contact form lives. */
  website: string | null;
}

interface Location {
  zip: string;
  city: string | null;
  state: string;
  district: number | null; // null for at-large / unknown
  districtLabel: string;   // e.g. "GA-5" or "WY-At large"
}

async function fetchJson(url: string, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/** ZIP -> { city, state, lat, lng } via zippopotam.us (no key). */
async function zipToPoint(zip: string) {
  const data = await fetchJson(`https://api.zippopotam.us/us/${zip}`);
  const place = data?.places?.[0];
  if (!place) return null;
  return {
    city: place['place name'] as string,
    state: place['state abbreviation'] as string,
    lat: Number(place.latitude),
    lng: Number(place.longitude),
  };
}

/** Point -> congressional district number via the Census geocoder (no key). */
async function pointToDistrict(lat: number, lng: number): Promise<number | null> {
  const u = new URL('https://geocoding.geo.census.gov/geocoder/geographies/coordinates');
  u.search = new URLSearchParams({
    x: String(lng),
    y: String(lat),
    benchmark: 'Public_AR_Current',
    vintage: 'Current_Current',
    layers: 'all',
    format: 'json',
  }).toString();
  const data = await fetchJson(u.toString());
  const geos = data?.result?.geographies ?? {};
  // The layer is named for the sitting Congress, e.g. "119th Congressional Districts".
  const key = Object.keys(geos).find((k) => /Congressional Districts/i.test(k));
  const entry = key ? geos[key]?.[0] : null;
  if (!entry) return null;
  const raw: string | undefined =
    Object.entries(entry).find(([k]) => /^CD\d+$/.test(k))?.[1] as string | undefined ?? entry.BASENAME;
  if (!raw) return null;
  // "00" and "98" mean at-large / non-voting delegate.
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 && n < 98 ? n : null;
}

async function membersForState(state: string, apiKey: string): Promise<Member[]> {
  const url = `${CONGRESS_API_BASE}/member/${state}?api_key=${apiKey}&format=json&limit=100&currentMember=true`;
  const data = await fetchJson(url);
  return ((data.members || []) as CongressMember[]).map((m) => ({
    bioguideId: m.bioguideId ?? null,
    name: m.name,
    party: m.partyName,
    state: m.state,
    district: m.district ?? null,
    chamber: m.terms?.item?.[0]?.chamber || (m.district ? 'House of Representatives' : 'Senate'),
    url: m.url,
    depiction: m.depiction?.imageUrl || null,
    website: null,
  }));
}

const websiteCache = new Map<string, string | null>();

/** Fills `website` from the member detail endpoint (the list endpoint omits it). */
async function withWebsites(members: Member[], apiKey: string): Promise<Member[]> {
  return Promise.all(
    members.map(async (m) => {
      if (!m.bioguideId) return m;
      if (websiteCache.has(m.bioguideId)) return { ...m, website: websiteCache.get(m.bioguideId) ?? null };
      try {
        const data = await fetchJson(`${CONGRESS_API_BASE}/member/${m.bioguideId}?api_key=${apiKey}&format=json`, 5000);
        const site: string | null = data?.member?.officialWebsiteUrl ?? null;
        websiteCache.set(m.bioguideId, site);
        return { ...m, website: site };
      } catch {
        return m;
      }
    }),
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = Deno.env.get('CONGRESS_API_KEY');
  if (!apiKey) {
    console.error('CONGRESS_API_KEY is not configured');
    return json({ error: 'Representative lookup is temporarily unavailable.' }, 500);
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Request body must be JSON.' }, 400);
  }

  const zip = typeof body.zip === 'string' ? body.zip.trim() : '';
  const stateInput = typeof body.state === 'string' ? body.state.trim().toUpperCase() : '';

  try {
    if (zip) {
      if (!/^\d{5}$/.test(zip)) return json({ error: 'ZIP code must be 5 digits.' }, 400);

      const point = await zipToPoint(zip);
      if (!point || !STATES.has(point.state)) {
        return json({ error: "We couldn't find that ZIP code." }, 404);
      }

      let district: number | null = null;
      try {
        district = await pointToDistrict(point.lat, point.lng);
      } catch (e) {
        // The geocoder is occasionally slow; fall back to the whole state delegation.
        console.error('Census geocoder failed:', e);
      }

      const all = await membersForState(point.state, apiKey);
      const senators = all.filter((m) => /senate/i.test(m.chamber));
      const house = all.filter((m) => !/senate/i.test(m.chamber));
      const houseForDistrict =
        district === null
          ? house.length === 1 ? house : [] // at-large states have exactly one
          : house.filter((m) => m.district === district);

      const location: Location = {
        zip,
        city: point.city,
        state: point.state,
        district,
        districtLabel: district === null ? `${point.state}-At large` : `${point.state}-${district}`,
      };

      return json({
        location,
        members: await withWebsites([...houseForDistrict, ...senators], apiKey),
        // Only set when we could not pin the district and the state has several.
        districtUnresolved: district === null && house.length > 1,
      });
    }

    if (stateInput) {
      if (!STATES.has(stateInput)) return json({ error: 'Unknown state code.' }, 400);
      const members = await membersForState(stateInput, apiKey);
      return json({ members });
    }

    return json({ error: 'Provide a zip or a state.' }, 400);
  } catch (error) {
    console.error('find-representatives error:', error);
    return json({ error: "We couldn't reach the representative directory. Please try again." }, 502);
  }
});
