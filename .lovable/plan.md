

# Big Functional Upgrades

Four major features to transform CivicCare from an informational site into a powerful civic engagement platform.

---

## 1. Personal Bill Tracker
Save/follow bills and see them on a personalized dashboard.

**Database**: New `tracked_bills` table (user_id, bill_id, bill_title, congress, bill_type, bill_number, created_at) with RLS policies for authenticated users.

**UI**: 
- Add a "Track this bill" bookmark button to bill cards in NewsSection and BillDetailModal
- New `/dashboard` page showing all tracked bills with latest status, sorted by most recent activity
- Badge count in sidebar showing number of tracked bills

**Files**: New migration, new `src/hooks/useTrackedBills.ts`, new `src/pages/Dashboard.tsx`, update `AppSidebar.tsx`, `NewsSection.tsx`, `BillDetailModal.tsx`

---

## 2. Rep Voting Records & Health Scorecard
Show how representatives voted on key health bills with a simple scorecard.

**Backend**: New edge function `rep-votes/index.ts` that calls the Congress API `/member/{bioguideId}` endpoint to fetch a member's sponsored/cosponsored bills, then filters for health-related ones.

**UI**:
- On the Representatives page, clicking a rep opens a detail panel/modal showing:
  - Number of health bills sponsored/cosponsored
  - A simple "Health Engagement Score" (count of health-related actions)
  - List of their health-related bills
- Color-coded score badge (green/yellow/red)

**Files**: New `supabase/functions/rep-votes/index.ts`, new `src/components/sections/RepDetailModal.tsx`, update `src/pages/Representatives.tsx`

---

## 3. Impact Calculator
Enter your situation, see which current bills affect you.

**Backend**: New edge function `impact-calculator/index.ts` that takes user profile (age, insurance type, income bracket, state) and uses Lovable AI to match against current health bills and explain personal impact.

**UI**:
- New `/impact` page with a multi-step form:
  - Step 1: Age range (18-26, 27-44, 45-64, 65+)
  - Step 2: Insurance type (employer, marketplace, Medicare, Medicaid, uninsured)
  - Step 3: Key concerns (prescription costs, mental health, maternal care, etc.)
- Results page showing matched bills with personalized impact explanations
- "Track this bill" and "Contact your rep" CTAs on each result

**Files**: New edge function, new `src/pages/Impact.tsx`, new `src/components/sections/ImpactForm.tsx`, new `src/components/sections/ImpactResults.tsx`, update `AppSidebar.tsx`, `App.tsx`

---

## 4. AI Health Policy Chatbot
Ask questions about how policies affect you and get AI-powered answers.

**Backend**: New edge function `health-chat/index.ts` using Lovable AI (gemini-3-flash-preview) with a system prompt that has context about health policy. Streaming SSE response.

**UI**:
- Floating chat button (bottom-right corner) available on all pages
- Slide-up chat panel with message history (session-only, no persistence)
- Markdown rendering for AI responses
- Suggested starter questions ("How does Medicare work?", "What bills affect insulin costs?", "Am I eligible for Medicaid?")

**Files**: New edge function `supabase/functions/health-chat/index.ts`, new `src/components/ChatWidget.tsx`, update `src/components/layout/AppLayout.tsx`

---

## Navigation Updates
- Add "My Dashboard" and "Impact Calculator" to sidebar nav
- Add route entries in `App.tsx`

## Implementation Order
1. Personal Bill Tracker (database + UI)
2. Impact Calculator (edge function + multi-step form)
3. Rep Voting Records (edge function + detail modal)
4. AI Chatbot (edge function + floating widget)

