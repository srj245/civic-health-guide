

# Make Find Care Page Actually Functional

## Problem
The "Search for Care" button only fires a toast ("Searching for care...") but never returns or displays any results. The page is essentially a static mockup.

## Solution
Build a working resource finder that searches for real healthcare facilities using the Google Places API via a backend function, then displays results on the page.

### 1. Create `find-care` edge function (`supabase/functions/find-care/index.ts`)
- Accepts zip code, category, and filter options
- Calls Google Places API (Text Search) to find nearby clinics, mental health providers, pharmacies, etc.
- Maps care categories to Google Places search queries (e.g. "primary care clinic near 55125")
- Returns structured results: name, address, phone, rating, open status, place URL
- Requires `GOOGLE_MAPS_API_KEY` secret

### 2. Create `useCareFinder` hook (`src/hooks/useCareFinder.ts`)
- Manages search state (results, loading, error)
- Calls the edge function with user inputs
- Returns typed care results

### 3. Update `FindCareSection` component
- Add a results area below/alongside the search form
- Show loading skeleton while searching
- Display results as cards with: facility name, address, phone, rating stars, "Get Directions" link
- Show "No results found" empty state
- Keep the emergency callout section

### 4. Secret setup
- Will need to add `GOOGLE_MAPS_API_KEY` secret for the edge function

## Files to create/modify
| File | Action |
|------|--------|
| `supabase/functions/find-care/index.ts` | Create edge function for Google Places search |
| `src/hooks/useCareFinder.ts` | Create hook for search state management |
| `src/components/sections/FindCareSection.tsx` | Add results display, loading states, empty states |

