import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CONGRESS_API_BASE = 'https://api.congress.gov/v3';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CONGRESS_API_KEY = Deno.env.get('CONGRESS_API_KEY');
    if (!CONGRESS_API_KEY) throw new Error('CONGRESS_API_KEY is not configured');

    const { state } = await req.json();
    if (!state) throw new Error('State is required');

    // Fetch members from the current congress for the given state
    const stateUpper = state.toUpperCase();
    const membersUrl = `${CONGRESS_API_BASE}/member/${stateUpper}?api_key=${CONGRESS_API_KEY}&format=json&limit=100&currentMember=true`;
    const res = await fetch(membersUrl);
    if (!res.ok) throw new Error(`Congress API error: ${res.status}`);

    const data = await res.json();

    const members = (data.members || [])
      .map((m: any) => ({
        name: m.name,
        party: m.partyName,
        state: m.state,
        district: m.district || null,
        chamber: m.terms?.item?.[0]?.chamber || (m.district ? 'House of Representatives' : 'Senate'),
        url: m.url,
        depiction: m.depiction?.imageUrl || null,
      }));

    return new Response(JSON.stringify({ members }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Find representatives error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
