import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { title, summary, latestAction } = await req.json();
    if (!title) throw new Error('Bill title is required');

    const prompt = `You are a civic education assistant. Summarize this congressional bill in 2-3 sentences that a high school student could understand. Focus on what the bill does and who it affects.

Bill Title: ${title}
${summary ? `Official Summary: ${summary}` : ''}
${latestAction ? `Latest Action: ${latestAction}` : ''}

Respond with a JSON object with two fields:
- "plainEnglish": A 2-3 sentence plain English summary
- "impact": A 1-2 sentence description of how this could affect everyday people's health or lives`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "bill_summary",
              description: "Return a plain English summary and impact statement for a bill",
              parameters: {
                type: "object",
                properties: {
                  plainEnglish: { type: "string", description: "2-3 sentence plain English summary" },
                  impact: { type: "string", description: "1-2 sentence impact on everyday people" },
                },
                required: ["plainEnglish", "impact"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "bill_summary" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result;
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content || '';
      try {
        result = JSON.parse(content);
      } catch {
        result = { plainEnglish: content, impact: "Impact information unavailable." };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Summarize bill error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
