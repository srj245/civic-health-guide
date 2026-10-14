# CivicCare: review of changes before push

Date: 2026-10-14. Everything below is uncommitted in the working tree of `C:\Users\karth\civic-health-guide`. Nothing has been pushed.

## Verification status

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `vite build` | passes |
| `vitest run` | 3 files, 13 tests, all passing |
| `eslint src supabase/functions` | 0 errors (see "Lint" below) |
| Home page in a local dev server | renders, live Congress.gov data loads |

**Two things only work after the edge functions are deployed** (through Lovable, or `supabase functions deploy`). Until then the live site still runs the old functions:

1. The ZIP code lookup shows "We couldn't look up that ZIP code right now" because the deployed function does not accept `zip` yet.
2. The hero and News page still show the Department of Defense bill, because the word-boundary filter fix lives in the function.

Deno is not installed on this machine, so the edge functions were typechecked with `tsc` and shims rather than `deno check`. Live calls to Congress.gov and the AI gateway were not exercised here (no keys in this shell). The ZIP to district chain was tested directly from Node against zippopotam.us and the Census geocoder (30309 resolves to GA-5, 94110 to CA-11).

## What changed, by plan tier

### Tier 1: must-haves

- **UI de-templated across every page.** Gone: typewriter headline, blurred orbs, floating shapes, glassmorphism, wave divider, pill badges, tilt cards, shimmer, wiggle, bounce-in, count-up, scroll-reveal opacity, onboarding modal, gradient page heroes. The home hero now shows three live bills. All pages share one `PageHero` header and one plain-card design language.
- **Fake stats removed.** "500+ bills", "26M+ people", "50 states", "Daily updates" are deleted, along with the engagement banner and "Most Discussed" that showed zeros to signed-out visitors.
- **Edge functions hardened** (`supabase/functions/_shared/http.ts`, `validate.ts`). Every function validates input, returns 400/405/429/502/500 with generic public messages, and never leaks `error.message` or missing-key names. Best-effort per-IP rate limits. Chat no longer forwards the client's raw message array; the system prompt is applied server-side. `verify_jwt` is unchanged so anonymous visitors can still demo the app.
- **Footer restored.** Privacy, Terms, and Accessibility are reachable again.

### Tier 2: makes it win

- **Health-bill filter bug fixed.** The old substring match let "intergovernmental" match "mental", which put a Department of Defense procurement bill at the top of the health page. New whole-word matcher in `_shared/health-filter.ts` with unit tests. This is the recommended answer to the "technical difficulty" question.
- **Real district lookup.** ZIP code resolves to a congressional district via zippopotam.us and the U.S. Census geocoder, then to the sitting House member and both senators from Congress.gov. The hardcoded ZIP-prefix-to-state table is gone. Falls back to the state delegation if the geocoder is slow.
- **Honest rep contact.** Members of Congress do not publish email addresses, so the empty `mailto:` is replaced with "Copy message" (a ready-to-paste draft) plus a link to the official contact page.
- **"Health Score" removed.** It was sponsored-bill count divided by ten, labelled as voting data. Now shows "Health bills sponsored this Congress: N" and "Cosponsored: N" with a sample list, scoped to the 119th Congress.
- **Impact calculator grounded.** Only health bills from the current Congress are sent to the model, as a numbered list of IDs it must choose from. Any ID it invents is dropped. Results show the official title, latest action, and a Congress.gov link beside the AI text.
- **Tests added.** `src/test/health-filter.test.ts` and `src/test/edge-http.test.ts` (error hiding, rate limiter, validators).
- **Accessibility made true.** Keyboard-reachable cards with Enter/Space, labels on every input, aria-labels on icon buttons, aria-live on chat and results, focus-visible rings, delete button visible on focus, reduced-motion respected. The Accessibility page now lists only what the code does and admits known gaps.
- **XSS fixed** in the map info window and the print view (user-visible data was concatenated into HTML unescaped).

### Tier 3: polish

- **README rewritten** with features, architecture diagram, data sources, run instructions, limitations, and the AI disclosure the rules require.
- **Working bill search** on the News page (keyword, topic, or bill number). The dead header search box is removed.
- **Dead code removed:** 31 unused shadcn components, 29 unused npm dependencies, the Vite template `App.css`, `placeholder.svg`, unused Header/ScrollProgress/tilt hook, 16 unused keyframes.
- **Honesty fixes:** fixed "last updated" dates, no more "delete your account" claim, dynamic copyright year, ordinal helper for "119th", About page lists the real stack.
- **Lint:** all `any` types replaced with interfaces; 0 ESLint errors. Remaining warnings are the standard shadcn "fast refresh" notices.

## Still open (not done here)

- **Commit authorship.** These changes must be reviewed and committed by the student under his own name. The plan doc explains why.
- **Deploy** the edge functions, then re-check the ZIP lookup and the hero bills on the live site.
- `.env` is still committed (publishable keys only). Lovable depends on it; leave it unless you move off Lovable.
- `bill_id` collides across Congresses in the comments and tracking tables (schema change; not attempted).
- `bun.lock` / `bun.lockb` are untouched in case Lovable's build uses bun.
- The demo video and written answers. Script and drafts are in `docs/CAC_GAME_PLAN.md`.

## Files

44 modified, 8 new, 42 deleted. Run `git status` or open the diff pane for the full list. Key new files:

- `supabase/functions/_shared/http.ts`, `validate.ts`, `health-filter.ts`
- `supabase/functions/find-representatives/index.ts` (rewritten)
- `src/lib/reps.ts`, `src/lib/format.ts`
- `src/components/sections/RepCard.tsx`
- `src/test/health-filter.test.ts`, `src/test/edge-http.test.ts`
- `docs/CAC_GAME_PLAN.md`, `docs/CHANGES_REVIEW.md`
