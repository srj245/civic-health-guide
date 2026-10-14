# CivicCare: Congressional App Challenge game plan

Written 2026-10-14. Submission deadline: **Monday, October 26, 2026, 12:00 pm EDT** (12 days).

## 1. What the Congressional App Challenge actually wants

Source: official 2026 CAC Rules PDF (congressionalappchallenge.us), 2018 judging rubric, and district winner pages.

### Hard rules
- Student must be enrolled in middle or high school on Oct 26, 2026. Compete in the district where you live or go to school. One app per student per year.
- App must be created after **Oct 30, 2025**. This repo's first real commits are Jan 31, 2026, so it qualifies.
- **Originality:** "All coding and technical development must be done by the student or student team." Open-source libraries and external tools are fine if documented.
- **AI usage:** permitted "provided that all AI usage is fully disclosed in the submission materials. AI may only be used to support specific aspects of the project and must not constitute the entirety of the technical development."
- Judges **may request source code and a live walkthrough**. Refusing is instant disqualification.
- Once submitted, nothing can be changed.

### What gets submitted
1. **Demo video, 1 to 3 minutes, public on YouTube or Vimeo.** Must include: each participant's name, the app name, the purpose in one sentence, the target audience, the tools and languages used, and a demonstration of the app working. The rules call this "the most critical component."
2. **Written answers** to roughly these six questions:
   1. Title of the app
   2. The app's purpose
   3. What inspired you
   4. What technical difficulty you faced and how you solved it
   5. What you learned; biggest takeaway
   6. What you would change in a 2.0 version

### How it is judged
Three criteria, each scored 1 to 5 by a panel the Member of Congress picks (typically local engineers, professors, and business people):
- **Concept**: how creative is the idea, does it address a specific problem, how creative is the solution.
- **Design**: did the student consider UX and UI, how intuitive is it, was design thought through.
- **Skill**: text-based language scores 4, multiple text-based languages scores 5. TypeScript plus SQL plus Deno edge functions already lands at 5 here if it is clearly the student's work.

Judging happens Oct 28 to Nov 23. Judges watch the video first. Many never open the app. The video carries most of the weight.

## 2. The single biggest risk: authorship

Every one of the 206 commits in this repo is by `gpt-engineer-app[bot]` (Lovable). The commit history is the first thing a technical judge opens if they pull the source. Right now it says the student wrote none of it.

This is fixable, but only by the student writing real code between now and Oct 26, under his own git identity, and disclosing Lovable and any AI assistant honestly in the "technical difficulty" and "tools used" answers. The strongest version of that disclosure is: "I prototyped the UI with Lovable, then rewrote X, Y, Z by hand. Here is the before and after." That is a compelling story to a judge, and it is true only if he does it.

Recommendation: from today, the student makes every commit himself and can explain every file in `supabase/functions` and `src/hooks` on a video call. The items in section 4 are chosen so they are things he can own.

## 3. What the app is today (audit summary)

What is real and good:
- Live bills from the Congress.gov v3 API, with official summaries.
- AI plain-English summaries (Gemini via Lovable gateway).
- Real Google Places search for clinics, with a map and favorites.
- Rep lookup by state, threaded bill discussion with realtime, tracked bills, a chat assistant.
- Supabase with row-level security that is mostly correct.

What hurts it with judges:
- **Looks like a template.** Gradient hero with a typewriter headline, blurred "mesh orbs", floating circles, glassmorphism cards, a wave divider, "Nonpartisan • Accessible • For Everyone" pill, tilt cards, shimmer, wiggle, count-up. Every page section fades in on scroll, so content is invisible until scrolled, which reads as broken on first paint and in screenshots.
- **Fake numbers.** "500+ Bills Tracked", "26M+ People Affected", "50 States Covered", "Daily Updates" are hardcoded. A judge who asks "where does 26M come from" ends the conversation.
- **Stats that only work signed in.** The engagement banner and "Most Discussed" read tables that anonymous users cannot see, so a judge visiting the site sees zeros or nothing.
- **"Health" is a keyword filter on bill titles** from the 250 most recently updated bills, not Congress's policy-area taxonomy. The impact calculator sends the 20 most recent bills of any topic to an LLM and lets it "use your knowledge", so it can invent bills.
- **Rep "Health Score"** is (sponsored + cosponsored bills matching broad keywords) / 10, labelled as voting data. It is not voting data.
- **Open edge functions.** Seven functions have `verify_jwt = false` and CORS `*`; anyone can burn the AI and Congress.gov quota. Chat passes the client's raw message array to the model.
- **No footer is rendered**, so Privacy, Terms, and Accessibility pages are unreachable. The Accessibility page claims reduced-motion support and 44px targets that the code does not have.
- **One test**, `expect(true).toBe(true)`.
- `.env` is committed. The search box in the header does nothing. 34 of 49 shadcn components are unused.

## 4. The plan, in priority order

### Tier 1: must happen (days 1 to 4)
1. **De-template the UI.** Remove the typewriter, orbs, floating shapes, wave, glassmorphism, tilt, shimmer, wiggle, count-up, and scroll-reveal opacity. Replace with a calm editorial layout: a strong headline, one real bill shown live in the hero, consistent page headers, real typography scale, `prefers-reduced-motion` respected. (This pass is in progress in this repo.)
2. **Delete every fake number.** Replace the stats section with live figures the app can actually compute (bills loaded this session, last Congress.gov update time) or remove it.
3. **Make anonymous visitors see a full app.** Fix the engagement counts and Most Discussed via `SECURITY DEFINER` count functions, or drop them.
4. **Lock the edge functions.** Require a JWT or add rate limiting, validate inputs, return generic errors, stop forwarding raw `messages` arrays. This is also the best possible answer to the "technical difficulty" question.
5. **Render the footer** so the legal pages exist again.

### Tier 2: makes it win (days 4 to 8)
6. **Use Congress.gov policy areas instead of title keywords.** The API exposes `policyArea` ("Health") per bill. Filtering on it is more accurate and is a real technical story.
7. **Ground the impact calculator.** Only pass health bills, pass bill IDs the model must choose from, and show the source summary beside the AI output so nothing is hallucinated.
8. **ZIP to actual district**, not ZIP prefix to state. The Census Geocoder (free, no key) returns the congressional district for an address. Then "Your Reps" is actually your reps.
9. **Rename "Health Score"** to something honest ("Health bills sponsored this Congress") and scope it to the current Congress.
10. **Real tests**: a handful of Vitest tests for the bill filter, the ZIP/district lookup, and one edge function. Judges who open the repo notice `src/test`.
11. **Accessibility pass** so the Accessibility page is true: labels on inputs, keyboard-reachable cards, focus-visible, reduced motion.

### Tier 3: polish (days 8 to 10)
12. Remove unused components, lockfiles, `App.css`, the Lovable README boilerplate. Write a real README with architecture diagram, data sources, and AI disclosure.
13. Working header search (filter bills by keyword).
14. Clean commit history going forward: small, descriptive commits by the student.

### Days 10 to 12: the submission
- Record the video (see section 5). Submit by Oct 24, two days early.

## 5. The demo video (the thing that actually wins)

Three minutes. Judges decide in the first 30 seconds.

| Time | Content |
|---|---|
| 0:00 to 0:20 | Name, app name, one sentence: "CivicCare turns health bills in Congress into plain English and shows you what to do about them." Target audience: students, first-time voters, families. |
| 0:20 to 0:40 | The problem, with one real bill on screen: show the official text, then show the plain-English version. |
| 0:40 to 2:10 | Live walkthrough of one complete loop: enter ZIP, see your real reps and the health bills that affect you, open a bill, read the summary, find a clinic nearby, send a message to your rep. No cuts that hide loading. |
| 2:10 to 2:40 | Tools: React, TypeScript, Supabase (Postgres, RLS, realtime), Deno edge functions, Congress.gov API, Google Places, Gemini. State plainly what was prototyped with Lovable and what was rewritten by hand. |
| 2:40 to 3:00 | What you learned and what 2.0 looks like. |

Film the screen with OBS, voice over, no music louder than the voice, captions on.

## 6. What the winning comparison set looks like

- HealthBridge (NY-03, 2025): connects underinsured people to clinics and insurance info, 15 languages, born from the students' clinic volunteering. Won on specificity of audience and a personal origin story.
- CivIQ AI (GA-10, 2025): AI bill summarizer. Won on a clear problem statement ("1,000 bills a year in technical language").
- Fire Up (CA-28, 2025): combines NASA, NOAA, and CalFire data on one map. Won on integrating real public data.
- Pattern across winners: one specific user, one complete loop, real public data, a personal reason for building it, and a demo that shows the loop working.

CivicCare's edge over all of them is that it does both halves: understand the policy, then act on it locally. The video has to show that bridge in one continuous flow.

## 7. Written answers: drafts to adapt

**Purpose.** CivicCare translates health legislation in Congress into plain English, shows who it affects, and connects people to real care and to their representatives.

**Inspiration.** (Student writes this. It must be personal and true. A family member's insurance confusion, a school health clinic, a news story he could not parse. Judges score Concept partly on this.)

**Technical difficulty.** Options that are real in this codebase: securing serverless functions that were open to the internet; reconciling Congress.gov's inconsistent bill data across Congresses; keeping an LLM from inventing bills by constraining it to IDs the server already fetched; resolving a ZIP code to a congressional district.

**AI disclosure (required).** "I used Lovable to generate the initial React/Tailwind scaffold and used an AI assistant for code review. I wrote and own the edge functions, the data layer, and the UI rewrite. All third-party libraries are listed in package.json and the README."

**2.0.** Spanish and other languages, state legislatures, push alerts when a tracked bill moves, a volunteer-verified clinic directory.
