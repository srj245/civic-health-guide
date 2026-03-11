import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ageRange, insuranceType, concerns, state } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // First fetch current health bills from Congress API
    const CONGRESS_API_KEY = Deno.env.get("CONGRESS_API_KEY");
    let billsContext = "";
    if (CONGRESS_API_KEY) {
      try {
        const billsRes = await fetch(
          `https://api.congress.gov/v3/bill?format=json&limit=20&sort=updateDate+desc&api_key=${CONGRESS_API_KEY}`
        );
        if (billsRes.ok) {
          const billsData = await billsRes.json();
          const bills = billsData.bills || [];
          billsContext = bills
            .map((b: any) => `- ${b.type?.toUpperCase()}${b.number}: "${b.title}" (Latest: ${b.latestAction?.text || 'N/A'})`)
            .join("\n");
        }
      } catch (e) {
        console.error("Failed to fetch bills for context:", e);
      }
    }

    const prompt = `You are a health policy analyst. A user has the following profile:
- Age range: ${ageRange}
- Insurance type: ${insuranceType}
- Health concerns: ${concerns.join(", ")}
- State: ${state}

Here are current bills in Congress:
${billsContext || "Unable to fetch current bills. Use your knowledge of recent health legislation."}

Analyze which bills are most relevant to this person and explain the personal impact. Return results using the provided function.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a nonpartisan health policy analyst. Be factual and helpful." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_impact_results",
              description: "Return personalized bill impact results",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        billTitle: { type: "string" },
                        billId: { type: "string" },
                        impact: { type: "string", description: "2-3 sentence explanation of how this bill affects the user" },
                        relevance: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["billTitle", "billId", "impact", "relevance"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["results"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_impact_results" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let results = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        results = parsed.results || [];
      } catch (e) {
        console.error("Failed to parse tool call:", e);
      }
    }

    // Sort by relevance
    const order = { high: 0, medium: 1, low: 2 };
    results.sort((a: any, b: any) => (order[a.relevance as keyof typeof order] ?? 2) - (order[b.relevance as keyof typeof order] ?? 2));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("impact-calculator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
