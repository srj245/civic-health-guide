# CivicCare

Health legislation in Congress, explained in plain English, with the tools to act on it: find your representatives, message them, and find care near you.

Built for the 2026 Congressional App Challenge. Live at https://civic-health-guide.lovable.app

## What it does

1. **Health bills, live.** Pulls the most recently updated bills from the Congress.gov API, keeps the ones about health, and shows the official summary next to a plain-English explanation generated from that summary.
2. **Who represents you.** A ZIP code is resolved to a congressional district (ZIP centroid from zippopotam.us, district from the U.S. Census geocoder), then matched to the sitting House member and both senators from Congress.gov. Each card copies a ready-to-paste message and links to the member's contact page.
3. **Who a bill affects.** Groups bills by the people they touch: students, families, seniors, workers, veterans.
4. **Find care.** Clinics, mental-health services, pharmacies, and low-cost care near a ZIP or city, via Google Places, with a map and saved favorites.
5. **Impact calculator.** Answer four questions and get the current health bills most relevant to your situation, chosen by an AI model from a server-supplied list so it cannot invent legislation.
6. **Discussion and tracking.** Signed-in users can track bills and discuss them in realtime threads.

## How it is built

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix primitives), React Router |
| Backend | Supabase: Postgres with row-level security, auth, realtime |
| Server functions | Deno edge functions in `supabase/functions` |
| Data | Congress.gov API v3, U.S. Census Geocoder, zippopotam.us, Google Places |
| AI | A Gemini model via the Lovable AI gateway, for plain-English bill summaries, the impact calculator, and the help chat |
| Tests | Vitest and Testing Library |

### Architecture

```
Browser (React)
  ├─ supabase-js ──► Postgres (tracked_bills, bill_comments, comment_votes, favorite_facilities)
  └─ functions.invoke ──► Edge functions (Deno)
                            ├─ congress-api ───────► api.congress.gov
                            ├─ find-representatives ► zippopotam.us ► Census geocoder ► api.congress.gov
                            ├─ rep-votes ──────────► api.congress.gov
                            ├─ summarize-bill ─────► AI gateway
                            ├─ impact-calculator ──► api.congress.gov + AI gateway
                            ├─ health-chat ────────► AI gateway (streamed)
                            └─ find-care ──────────► Google Places (signed-in users only)
```

Edge functions validate every input, return generic error messages, and apply a best-effort per-IP rate limit. The health classifier (`supabase/functions/_shared/health-filter.ts`) matches whole words only; a substring match let "intergovernmental" match "mental" and surfaced a Department of Defense bill as health legislation.

## Running locally

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run build
```

The frontend needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (see `.env`). Edge functions need `CONGRESS_API_KEY` (free at api.congress.gov/sign-up), `LOVABLE_API_KEY`, and `GOOGLE_MAPS_API_KEY` set as Supabase secrets.

## AI and tool disclosure

Per Congressional App Challenge rules, all AI use is disclosed here.

- The initial React, Tailwind, and Supabase scaffold was generated with Lovable, an AI app builder.
- An AI coding assistant was used for code review and for parts of the rewrite described in `docs/CAC_GAME_PLAN.md`.
- At runtime the app calls an AI model to summarize bill text and to rank bills in the impact calculator. The model is constrained to data the server already fetched from Congress.gov.
- All third-party libraries are listed in `package.json`. Data sources are listed above.

## Limitations

- "Health" is determined from the bill title; Congress.gov's list endpoint does not expose the policy-area field.
- District lookup uses the ZIP centroid, so a ZIP that straddles two districts resolves to one of them.
- Care results come straight from Google Places; "low-cost" and "telehealth" are search terms, not verified attributes.
- CivicCare is not legal or medical advice.
