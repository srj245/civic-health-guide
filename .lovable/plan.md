

# Over-the-Top Visual Upgrades

## Big Changes

### 1. Bring Back the Full-Screen Hero
The `HeroSection` component exists but is **not used anywhere**. The homepage currently just has a plain text greeting. Adding the full-screen animated hero with gradient background, floating orbs, wave divider, and CTAs will be the single biggest visual upgrade.

### 2. Animated Gradient Text on Key Headings
Add a flowing gradient animation to hero headlines and section titles — the text color shifts through purple/violet/amber continuously. Pure CSS, extremely eye-catching.

### 3. Scroll Progress Bar
A slim gradient bar fixed to the very top of the viewport that fills as you scroll down the page. Visible site-wide.

### 4. 3D Tilt Hover on Cards
Cards across the site get a subtle CSS perspective tilt on mouse move (using a lightweight `onMouseMove` handler). Creates a "floating card" illusion without any library.

### 5. Animated Background Mesh on Hero
Add slowly moving, blurred gradient orbs behind the hero that drift around — creates a living, breathing background feel.

### 6. Typewriter Effect on Hero Headline
The hero title types itself out letter by letter on mount, then the cursor blinks. High drama.

### 7. Glassmorphism Upgrade for Action Cards
The Action section cards and newsletter box get a stronger glass effect with backdrop-blur, subtle border gradients, and inner glow on hover.

### 8. Parallax Floating Decorative Elements
Add decorative shapes (circles, rings) that move at different scroll speeds throughout the page for depth.

## Files Modified
- `src/pages/Index.tsx` — add HeroSection, parallax wrapper
- `src/components/sections/HeroSection.tsx` — typewriter effect, animated mesh bg, gradient text
- `src/components/layout/Header.tsx` — scroll progress bar
- `src/index.css` — gradient text animation, glassmorphism classes, parallax utilities
- `tailwind.config.ts` — new keyframes for gradient shift, typewriter
- `src/components/sections/ActionSection.tsx` — glassmorphism upgrade
- `src/pages/Index.tsx` — tilt card hook applied to quick action cards
- New: `src/hooks/useTilt.ts` — reusable 3D tilt hook
- New: `src/components/ScrollProgress.tsx` — scroll progress bar component

