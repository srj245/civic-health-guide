import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const categoryQueries: Record<string, string> = {
  primary: "primary care clinic community health center",
  mental: "mental health counseling therapy",
  pharmacy: "pharmacy low cost prescription",
  specialty: "specialist doctor sliding scale",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY not configured");
    }

    const { zipCode, category, lowCostOnly, includeTelehealth } = await req.json();

    if (!zipCode || typeof zipCode !== "string" || zipCode.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Zip code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search query
    let query = category && categoryQueries[category]
      ? categoryQueries[category]
      : "healthcare clinic";

    if (lowCostOnly) query += " free low cost";
    if (includeTelehealth) query += " telehealth virtual";
    query += ` near ${zipCode.trim()}`;

    // Call Google Places Text Search API
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("type", "health");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Places API error:", data.status, data.error_message);
      throw new Error(`Places API error: ${data.status}`);
    }

    const results = (data.results || []).slice(0, 10).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || null,
      totalRatings: place.user_ratings_total || 0,
      isOpen: place.opening_hours?.open_now ?? null,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      types: place.types || [],
    }));

    return new Response(
      JSON.stringify({ results, query }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("find-care error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
