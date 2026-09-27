import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

const categoryQueries: Record<string, string> = {
  primary: "primary care clinic community health center",
  mental: "mental health counseling clinic",
  pharmacy: "pharmacy",
  specialty: "specialist medical clinic",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Require a signed-in user (keeps the paid Maps search from being an open public proxy)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) {
      return json({ error: "Please sign in to search for care near you.", code: "auth_required" }, 401);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      console.error("Missing Google Maps connector credentials");
      return json({ error: "Care search is temporarily unavailable." }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const zipCode = typeof body.zipCode === "string" ? body.zipCode.trim().slice(0, 100) : "";
    const { category, lowCostOnly, includeTelehealth } = body;
    if (!zipCode) return json({ error: "Please enter a ZIP code or city." }, 400);

    let query = category && categoryQueries[category] ? categoryQueries[category] : "health clinic";
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
      const details = await response.text();
      console.error(`Places request failed [${response.status}]: ${details}`);
      return json({ error: "We couldn't reach the care search service right now. Please try again shortly." }, 502);
    }

    const data = await response.json();
    const results = (data.places || []).map((p: any) => ({
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
    console.error("find-care error:", error);
    return json({ error: "Something went wrong while searching. Please try again." }, 500);
  }
});
