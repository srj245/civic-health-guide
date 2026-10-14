/**
 * Shared HTTP helpers for the edge functions.
 *
 * - `corsHeaders`: permissive CORS so the browser client (and Supabase's own
 *   client headers) can call the functions.
 * - `json(data, status)`: JSON response with CORS.
 * - `fail(status, publicMessage, err?)`: logs the real error server-side and
 *   returns ONLY the generic public message. Never leak `error.message`,
 *   stack traces, or configuration details ("X is not configured") to the
 *   client.
 * - `rateLimit(req, opts)`: best-effort in-memory limiter keyed on the caller IP.
 */

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Returns an error response with a generic public message. The real error (if
 * any) is logged with console.error so it shows up in the function logs, but
 * is never sent to the client.
 */
export function fail(status: number, publicMessage: string, err?: unknown): Response {
  if (err !== undefined) {
    console.error(`[${status}] ${publicMessage}:`, err);
  } else if (status >= 500) {
    console.error(`[${status}] ${publicMessage}`);
  }
  return json({ error: publicMessage }, status);
}

/** Standard replies so every function speaks the same way. */
export function preflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export function methodNotAllowed(): Response {
  return json({ error: "Method not allowed." }, 405);
}

export function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

/**
 * Parses a JSON body into a plain object. Returns {} for an empty/invalid body
 * and `null` if the body is JSON but not an object (array, string, ...).
 */
export async function readJsonObject(req: Request): Promise<Record<string, unknown> | null> {
  let parsed: unknown;
  try {
    const text = await req.text();
    if (!text.trim()) return {};
    parsed = JSON.parse(text);
  } catch {
    return {};
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  return parsed as Record<string, unknown>;
}

/**
 * Best-effort, per-isolate in-memory rate limiter.
 *
 * Supabase edge functions run on Deno Deploy / edge runtime isolates. Memory is
 * NOT shared between isolates or regions and an isolate can be recycled at any
 * time, so this is a soft limit that stops a single client from hammering one
 * warm instance (burning Congress.gov / AI quota), not a hard global guarantee.
 * For a hard limit, use a shared store (e.g. a Postgres table or Upstash).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 5000;

function clientKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  const ip =
    (xff ? xff.split(",")[0].trim() : "") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return ip;
}

export function rateLimit(
  req: Request,
  { limit, windowMs }: { limit: number; windowMs: number },
): Response | null {
  const now = Date.now();
  const key = clientKey(req);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    if (buckets.size > MAX_BUCKETS) buckets.clear();
  }

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      },
    );
  }
  return null;
}
