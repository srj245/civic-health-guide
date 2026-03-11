

# Restyle CivicCare with Dialpad-inspired UI

## What changes

Adopt Dialpad's visual language: deep purple primary, white/light background, left sidebar navigation, clean card-based layouts, and yellow/amber accent highlights.

## Color palette update (`src/index.css`)

**Light mode:**
- Background: pure white / very light gray (`0 0% 99%`)
- Primary: deep purple (`262 60% 32%`) matching Dialpad's purple
- Accent: warm amber/yellow (`42 90% 55%`) for highlights and sidebar accents
- Foreground: near-black (`220 15% 15%`)
- Success, destructive, etc. adjusted to complement purple

**Dark mode:** Deep purple-gray tones with lighter purple accents

## Layout overhaul

Replace the current top-nav Header with a **left sidebar + top header bar** layout:

1. **New `AppSidebar` component** using the existing shadcn Sidebar:
   - Icon-based nav items: Home, Health News, Who's Affected, Find Care
   - Purple active state highlight
   - Yellow/amber left-border accent on active item (like Dialpad)
   - CivicCare logo at top

2. **New `AppLayout` component** wrapping all pages:
   - `SidebarProvider` + `AppSidebar` + main content area
   - Slim top header bar with `SidebarTrigger`, search bar placeholder, and theme toggle
   - Replaces the current per-page `<Header />` and `<Footer />`

3. **Update all pages** (Index, News, Affected, Care) to remove Header/Footer and use the new layout

4. **Update `App.tsx`** to wrap routes in `AppLayout`

## Page content adjustments

- **Index page**: Replace full-screen gradient hero with a clean card-based dashboard view (welcome cards similar to Dialpad's "Make a call" / "Start a meeting" quick-action cards, but for CivicCare: "Explore Bills", "Find Care", "See Who's Affected", "Take Action")
- **Hero section**: Simplified — white background, purple headline text, no full-bleed gradient
- Keep existing section components but remove redundant PageHero from sub-pages (sidebar already indicates context)

## Button/component style updates (`button.tsx`, `tailwind.config.ts`)

- Hero button variant updated to deep purple gradient
- Accent buttons use amber/yellow
- Cards get subtle purple-tinted borders on hover

## Files to create/modify

| File | Action |
|------|--------|
| `src/index.css` | Update all CSS variables to purple/white/amber palette |
| `src/components/AppSidebar.tsx` | Create sidebar with nav items |
| `src/components/layout/AppLayout.tsx` | Create layout wrapper with sidebar + header |
| `src/App.tsx` | Wrap routes in AppLayout |
| `src/pages/Index.tsx` | Replace hero with dashboard-style cards |
| `src/pages/News.tsx` | Remove Header/Footer |
| `src/pages/Affected.tsx` | Remove Header/Footer |
| `src/pages/Care.tsx` | Remove Header/Footer |
| `src/components/sections/HeroSection.tsx` | Restyle to white bg + purple text |
| `src/components/ui/button.tsx` | Update hero/accent variants for purple/amber |

