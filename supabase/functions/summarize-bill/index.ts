import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  badRequest,
  fail,
  json,
  methodNotAllowed,
  preflight,
  rateLimit,
  readJsonObject,
} from "../_shared/http.ts";
import { parseBillId, parseCongress, parseText } from "../_shared/validate.ts";

const TITLE_MAX = 500;
const SUMMARY_MAX = 6000;
const ACTION_MAX = 500;

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return methodNotAllowed();

  const limited = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return fail(500, "Summaries are temporarily unavailable.", "LOVABLE_API_KEY missing");

    const body = await readJsonObject(req);
    if (!body) return badRequest("Request body must be a JSON object.");

    // billId / congress are optional (the client may only have the title), but
    // when present they must be well-formed.
    let billId: string | null = null;
    if (body.billId !== undefined && body.billId !== null && body.billId !== "") {
      const parsed = parseBillId(body.billId);
      if (!parsed) return badRequest("billId must look like hr1234 or s567.");
      billId = parsed.id;
    }
    const congress = parseCongress(body.congress);
    if (congress === null) return badRequest("congress must be a whole number between 93 and 130.");

    const title = parseText(body.title, { max: TITLE_MAX, required: true });
    if (!title) return badRequest("A bill title is required.");
    const summary = parseText(body.summary, { max: SUMMARY_MAX });
    const latestAction = parseText(body.latestAction, { max: ACTION_MAX });
    if (summary === null || latestAction === null) return badRequest("summary and latestAction must be text.");

    const prompt = `You are a civic education assistant. Summarize this congressional bill in 2-3 sentences that a high school student could understand. Focus on what the bill does and who it affects. Use only the information below; do not invent provisions.

${billId ? `Bill: ${billId.toUpperCase()} (${congress}th Congress)\n` : ""}Bill Title: ${title}
${summary ? `Official Summary: ${summary}` : ""}
${latestAction ? `Latest Action: ${latestAction}` : ""}

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
        messages: [{ role: "user", content: prompt }],
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
      if (response.status === 429) return json({ error: "Rate limited, please try again shortly." }, 429);
      if (response.status === 402) return json({ error: "AI credits exhausted." }, 402);
      const text = await response.text().catch(() => "");
      return fail(502, "The summary service is unavailable right now.", `AI gateway ${response.status}: ${text}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result: { plainEnglish: string; impact: string };

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      result = {
        plainEnglish: String(parsed.plainEnglish ?? ""),
        impact: String(parsed.impact ?? ""),
      };
    } else {
      const content: string = data.choices?.[0]?.message?.content ?? "";
      try {
        const parsed = JSON.parse(content);
        result = { plainEnglish: String(parsed.plainEnglish ?? content), impact: String(parsed.impact ?? "") };
      } catch {
        result = { plainEnglish: content, impact: "Impact information unavailable." };
      }
    }

    return json({ ...result, billId, congress });
  } catch (error) {
    return fail(500, "Could not summarize this bill right now. Please try again.", error);
  }
});
