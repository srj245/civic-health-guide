

# Polish CivicCare to its Best

After reviewing the entire codebase, here are high-impact improvements grouped into categories:

## 1. Scroll-to-top + Page Transitions
- Add smooth scroll-to-top on route changes (currently only some navigations do this)
- Add a subtle fade-in transition on page mount for all pages

## 2. Skeleton Loading States on All Pages
- News, Affected, Care, and Representatives pages currently jump-in without page-level loading polish
- Add consistent entry animations (staggered fade-in-up) to card grids across all pages

## 3. "Clear Zip" Button on District Dashboard
- Add a small X button next to the zip input so users can reset their saved location without manually deleting

## 4. Responsive & Accessibility Fixes
- Header: the mobile menu doesn't close on route change in all cases
- Footer links use raw `<a>` tags instead of `react-router-dom` navigation, causing full-page reloads
- Add `aria-live="polite"` to loading/error states for screen readers
- Add focus-visible rings to all interactive cards (some only have hover states)

## 5. Empty State Improvements
- District Dashboard "no results" after search should show a friendlier message with a retry CTA
- Affected page modals that show "no bills found" should suggest browsing the News page instead of just Congress.gov

## 6. Newsletter Actually Stores Emails
- Currently the subscribe form just shows a toast — store emails in a database table so they persist
- Create a `newsletter_subscribers` table with email + created_at

## 7. SEO & Meta Tags
- Add `<title>` and `<meta description>` per page using `document.title` in useEffect or a small hook
- Improves sharing previews on social media

## 8. Performance: Lazy Load Pages
- Wrap page imports in `React.lazy()` + `Suspense` to reduce initial bundle size
- Add a minimal loading fallback

## Files Modified
- `src/App.tsx` — lazy imports, scroll restoration, Suspense wrapper
- `src/components/layout/Footer.tsx` — use react-router Link instead of `<a>`
- `src/components/sections/DistrictDashboard.tsx` — add clear zip button
- `src/components/sections/AffectedSection.tsx` — better empty state with link to /news
- `src/components/sections/ActionSection.tsx` — wire newsletter to database
- `src/pages/*.tsx` — add page titles via useEffect, entry animations
- **New migration** — create `newsletter_subscribers` table with RLS

