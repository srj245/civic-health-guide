import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HEALTH_KEYWORDS = [
  "health", "medicare", "medicaid", "drug", "pharmaceutical", "prescription",
  "insurance", "mental health", "hospital", "medical", "patient", "care",
  "veteran", "disability", "maternal", "reproductive", "opioid", "vaccine",
];

function isHealthRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return HEALTH_KEYWORDS.some((kw) => lower.includes(kw));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bioguideId } = await req.json();
    if (!bioguideId) throw new Error("bioguideId is required");

    const API_KEY = Deno.env.get("CONGRESS_API_KEY");
    if (!API_KEY) throw new Error("CONGRESS_API_KEY is not configured");

    // Fetch sponsored and cosponsored bills in parallel
    const [sponsoredRes, cosponsoredRes] = await Promise.all([
      fetch(`https://api.congress.gov/v3/member/${bioguideId}/sponsored-legislation?format=json&limit=50&api_key=${API_KEY}`),
      fetch(`https://api.congress.gov/v3/member/${bioguideId}/cosponsored-legislation?format=json&limit=50&api_key=${API_KEY}`),
    ]);
    const [sponsoredData, cosponsoredData] = await Promise.all([
      sponsoredRes.ok ? sponsoredRes.json() : { sponsoredLegislation: [] },
      cosponsoredRes.ok ? cosponsoredRes.json() : { cosponsoredLegislation: [] },
    ]);
    const sponsored = sponsoredData.sponsoredLegislation || [];
    const cosponsored = cosponsoredData.cosponsoredLegislation || [];

    // Filter for health-related
    const healthSponsored = sponsored.filter((b: any) => isHealthRelated(b.title || ""));
    const healthCosponsored = cosponsored.filter((b: any) => isHealthRelated(b.title || ""));

    // Build health bills list
    const healthBills = [
      ...healthSponsored.map((b: any) => ({
        title: b.title,
        type: b.type || "",
        number: b.number || 0,
        congress: b.congress || 119,
        role: "sponsor",
      })),
      ...healthCosponsored.slice(0, 20).map((b: any) => ({
        title: b.title,
        type: b.type || "",
        number: b.number || 0,
        congress: b.congress || 119,
        role: "cosponsor",
      })),
    ];

    // Calculate score (0-10)
    const totalHealth = healthSponsored.length + healthCosponsored.length;
    const score = Math.min(10, Math.round((totalHealth / 10) * 10));
    
    let scoreLabel = "Low Health Engagement";
    if (score >= 7) scoreLabel = "Strong Health Advocate";
    else if (score >= 4) scoreLabel = "Moderate Health Engagement";

    return new Response(
      JSON.stringify({
        healthBills,
        sponsoredCount: healthSponsored.length,
        cosponsoredCount: healthCosponsored.length,
        score,
        scoreLabel,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("rep-votes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
