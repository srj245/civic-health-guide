

# Add Polished Micro-Animations

After reviewing all components, here's a focused set of high-impact micro-animations that will make the UI feel alive and responsive.

## What Gets Added

### 1. New Keyframes & Utilities (tailwind.config.ts + index.css)
- **shimmer**: A subtle gradient sweep for loading states and decorative accents
- **bounce-in**: Spring-like entrance for icons and badges
- **wiggle**: Small rotation shake for attention-grabbing elements (e.g., emergency callout icon)
- **slide-up-fade**: Staggered entrance for list items
- **scale-spring**: Bouncy scale on hover for cards and buttons
- CSS utility classes for staggered children animations (`stagger-children`)

### 2. Header Micro-Interactions (Header.tsx)
- Logo heart icon pulses gently on hover with a bounce
- Nav links get an animated underline (slide-in from left)
- Mobile menu items stagger in one-by-one
- Hamburger icon rotates smoothly between states

### 3. Card Hover Polish (Index.tsx, NewsSection.tsx, FindCareSection.tsx)
- Cards: icon translates up slightly on hover, arrow slides right
- Quick action cards: icon container does a subtle bounce on hover
- News cards: badge does a gentle scale-in on mount

### 4. Hero Section (HeroSection.tsx)
- CTA buttons get a shimmer sweep effect on hover
- Feature highlight icons float gently (staggered)
- Badge does a bounce-in entrance

### 5. How It Works (HowItWorksSection.tsx)
- Step icons bounce-in with intersection observer (staggered by index)
- Dashed connector line animates (draws in) on scroll
- Step numbers pulse once on entrance

### 6. Action Section (ActionSection.tsx)
- Action card icons do a wiggle on hover
- Arrow gap transition already exists -- make it smoother with a spring curve
- Newsletter input gets a focus ring animation (ring expands outward)

### 7. FAQ Section (FaqSection.tsx)
- Accordion chevron rotates with a spring easing
- Items stagger-fade on scroll into view

### 8. District Dashboard (DistrictDashboard.tsx)
- Rep cards stagger in with slide-up-fade
- Party badge does a scale-in on mount
- "Email" button icon tilts on hover

### 9. Statistics Section (StatisticsSection.tsx)
- Icon does a bounce-in when counter starts
- Card border briefly glows primary color on entrance

### 10. Global CSS Utilities (index.css)
- `.group-hover-lift` — child translates up 2px on parent hover
- `.animate-underline` — sliding underline for links
- Smooth focus ring expansion animation

## Technical Approach
- All animations use CSS keyframes + Tailwind utilities (no JS animation libraries)
- Intersection Observer reused for scroll-triggered entrances
- `prefers-reduced-motion: reduce` media query respects user accessibility preferences
- Keep all durations under 500ms for snappiness

## Files Modified
- `tailwind.config.ts` — new keyframes and animation utilities
- `src/index.css` — CSS utility classes, reduced-motion support
- `src/components/layout/Header.tsx` — nav underlines, logo bounce, staggered mobile menu
- `src/components/sections/HeroSection.tsx` — shimmer CTAs, bouncing badge, floating icons
- `src/components/sections/HowItWorksSection.tsx` — scroll-triggered step entrances
- `src/components/sections/ActionSection.tsx` — icon wiggle on hover, ring animation
- `src/components/sections/FaqSection.tsx` — staggered accordion items
- `src/components/sections/NewsSection.tsx` — card hover polish
- `src/components/sections/StatisticsSection.tsx` — icon bounce-in, border glow
- `src/components/sections/FindCareSection.tsx` — category card hover polish
- `src/components/sections/DistrictDashboard.tsx` — staggered rep cards
- `src/pages/Index.tsx` — quick action card icon lift

