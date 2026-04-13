# Kliekjesclub Brand Guide

> Deel je kliekjes, maak iemand blij.

---

## 1. Brand Identity

### Mission
Kliekjesclub verbindt mensen die eten over hebben met mensen die er blij mee zijn. Samen tegen voedselverspilling.

### Brand Voice
- **Warm & uitnodigend** - We spreken mensen aan als buren, niet als klanten
- **Informeel** - Tutoyeren, korte zinnen, Nederlands
- **Positief** - Focus op delen en verbinding, niet op het probleem
- **Praktisch** - Geen jargon, direct to the point

### Tagline
*Deel je kliekjes, maak iemand blij.*

---

## 2. Logo

The Kliekjesclub logo features a friendly character composed of food containers (a jar, cups, a bowl, a fork and spoon) arranged in a circular composition with the brand name "KLIEKJESCLUB.NL" integrated into the design.

### Logo Files
- **Primary (green on transparent):** `/apps/web/public/logo.png`
- **Favicon:** `/apps/web/public/favicon.png`

### Logo Usage Rules
- Minimum clear space: equal to the height of the "K" in the wordmark
- Minimum size: 40px height for digital use
- Do not stretch, rotate, or recolor the logo
- On dark backgrounds, use the green-on-transparent version
- On light backgrounds, the green-on-transparent version works natively

---

## 3. Color Palette

### Primary - Brand Green
The main brand color is a vibrant, natural green representing freshness, sustainability, and growth.

| Token | Hex | Usage |
|-------|-----|-------|
| Brand 50 | `#f0fdf4` | Light backgrounds, hover states |
| Brand 100 | `#dcfce7` | Tag backgrounds, icon backgrounds |
| Brand 200 | `#bbf7d0` | Borders on active elements |
| Brand 300 | `#86efac` | Highlight text on dark backgrounds |
| Brand 400 | `#4ade80` | Secondary accents |
| **Brand 500** | **`#22c55e`** | **Primary brand color - buttons, links, active states** |
| Brand 600 | `#16a34a` | Button hover, emphasis text |
| Brand 700 | `#15803d` | Dark text on light green backgrounds |
| Brand 800 | `#166534` | Very dark green accents |
| Brand 900 | `#14532d` | Darkest green, rarely used |

### Neutral - Warm Grays
An earthy warm gray palette that gives the platform its friendly, approachable feel.

| Token | Hex | Usage |
|-------|-----|-------|
| Warm 100 | `#f0eeeb` | Subtle borders, dividers, input backgrounds |
| Warm 200 | `#e5e1dc` | Borders, divider lines |
| Warm 300 | `#d1cbc4` | Disabled states |
| Warm 400 | `#b0a89e` | Placeholder text, secondary icons |
| Warm 500 | `#8a8680` | Secondary text, footer text |
| Warm 600 | `#6b6660` | Body text, navigation links |
| Warm 700 | `#524d48` | Emphasis body text |
| Warm 800 | `#3d3833` | Primary text, headings (secondary) |
| Warm 900 | `#2a2520` | Darkest text, hero overlays |

### Background Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Off-White | `#faf9f6` | Primary page background |
| Cream | `#f5f0e8` | Section backgrounds, auth pages |
| White | `#ffffff` | Cards, inputs, elevated surfaces |

### Semantic Colors
Standard utility colors used alongside the brand palette:

| Usage | Color | Source |
|-------|-------|--------|
| Error/Danger | Red (Tailwind `red-*`) | Validation errors, cancel buttons, allergen badges |
| Warning | Amber (Tailwind `amber-*`) | Pending states, warning badges |
| Info/Frozen | Blue (Tailwind `blue-*`) | Frozen dish indicator |
| Fresh | Orange (Tailwind `orange-*`) | Fresh dish indicator |
| Star rating | `#f59e0b` (Amber 500) | Review stars |

---

## 4. Typography

### Font Family
**Nunito** - A rounded, friendly sans-serif that reinforces the warm, approachable brand personality.

```css
font-family: 'Nunito', system-ui, sans-serif;
```

### Font Weights
| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body text, descriptions |
| 600 | Semibold | Navigation links, labels |
| 700 | Bold | Card titles, section headings, buttons |
| 800 | Extra Bold | Page headings, hero text, brand name |

### Type Scale (Web)
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Hero heading | `text-5xl` (48px) | Extra Bold | White (on dark) or Warm 900 |
| Page heading (h1) | `text-3xl` (30px) | Extra Bold | Warm 900 |
| Section heading (h2) | `text-xl` (20px) | Bold | Warm 900 |
| Card title | `text-lg` (18px) | Bold | Warm 900 |
| Body text | `text-base` (16px) | Regular | Warm 600-700 |
| Small text | `text-sm` (14px) | Regular/Semibold | Warm 500-600 |
| Caption / meta | `text-xs` (12px) | Regular | Warm 400-500 |
| Badge text | `text-xs` (12px) | Bold | Context-dependent |

---

## 5. Spacing

Consistent spacing scale used across all platforms:

| Token | Value | Usage |
|-------|-------|-------|
| XS | 4px | Tight gaps, icon padding |
| SM | 8px | Small gaps between related elements |
| MD | 16px | Standard component padding |
| LG | 24px | Section padding, card padding |
| XL | 32px | Large section gaps |
| 2XL | 48px | Page section spacing |
| 3XL | 64px | Major section breaks |

### Page Layout
- **Max content width:** 1280px (`max-w-7xl`)
- **Horizontal page padding:** 24px (`px-6`)
- **Vertical section padding:** 32-48px (`py-8` to `py-12`)

---

## 6. Border Radius

Rounded corners are a key part of the Kliekjesclub visual identity, contributing to the friendly, approachable feel.

| Token | Value | Usage |
|-------|-------|-------|
| XS | 6px | Small chips, inline badges |
| SM | 8px | Checkboxes, small tags |
| MD | 12px | Input fields, dropdowns |
| LG | 16px | Standard cards, modals |
| XL | 20px | Buttons, navigation pills, tags |
| 2XL | 24px | Large cards, content sections |
| 3XL | 32px | Hero images, feature sections |
| Full | 9999px | Avatars, circular badges, pills |

---

## 7. Shadows

Subtle, warm shadows that create depth without harshness.

| Token | Value | Usage |
|-------|-------|-------|
| Card | `0 2px 8px rgba(0,0,0,0.06)` | Default card elevation |
| Card Hover | `0 4px 16px rgba(0,0,0,0.1)` | Card hover state |
| Button | `0 2px 4px rgba(34,197,94,0.3)` | Primary button glow |

---

## 8. Components

### Buttons

**Primary Button**
- Background: Brand 500 (`#22c55e`)
- Text: White, Bold
- Hover: Brand 600 (`#16a34a`)
- Active: Scale 0.97 + Brand 700
- Border radius: XL (20px)
- Padding: 10px 20px
- Shadow: Button shadow

**Outline Button**
- Background: Transparent
- Border: Warm 200 (`#e5e1dc`)
- Text: Warm 700, Semibold
- Hover: Warm 50 background
- Border radius: XL (20px)

**Danger Button**
- Border: Red 200
- Text: Red 600
- Hover: Red 50 background

### Cards
- Background: White
- Border radius: 2XL (24px)
- Shadow: Card shadow
- Padding: 24px
- Hover shadow: Card Hover (on interactive cards)

### Input Fields
- Background: White
- Border: Warm 200
- Border radius: XL (20px)
- Padding: 12px 16px
- Focus border: Brand 400
- Focus ring: 2px Brand 100
- Placeholder color: Warm 400

### Badges / Tags
- Border radius: XL (20px) or Full (pill)
- Padding: 4px 10px
- Font: text-xs, Bold
- Variants:
  - Green: Brand 100 bg, Brand 700-800 text
  - Red: Red 50 bg, Red 700 text (allergens)
  - Amber: Amber 100 bg, Amber 700 text (pending)
  - Blue: Blue 100 bg, Blue 800 text (frozen)
  - Orange: Orange 100 bg, Orange 800 text (fresh)

### Status Badges
| Status | Background | Text |
|--------|-----------|------|
| Beschikbaar | Green 100 | Green 800 |
| Gereserveerd | Amber 100 | Amber 800 |
| Opgehaald | Gray 100 | Gray 700 |
| Verlopen | Red 100 | Red 800 |
| In afwachting | Amber 100 | Amber 700 |
| Bevestigd | Brand 100 | Brand 700 |
| Geannuleerd | Red 100 | Red 700 |

### Star Ratings
- Filled: `#f59e0b` (Amber 500)
- Half: `#f59e0b` (Amber 500)
- Empty: `#c4bdb4` (Warm 300)

---

## 9. Iconography

### Web
- **Style:** Heroicons (outline, 1.5px stroke)
- **Default size:** 20px (`h-5 w-5`)
- **Color:** Inherits from parent text color
- **In cards/features:** 24px in a 40px rounded-xl container with Brand 100 background

### Mobile
- **Style:** Ionicons (outline variants)
- **Default size:** 20-24px
- **Tab bar:** 24px, active: Brand 500, inactive: Warm 500

---

## 10. Animation & Motion

### Scroll Reveal
- **Duration:** 600ms
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- **Effects:** Fade in + translate Y (24px) / translate X / scale
- **Stagger:** 100ms between items
- **Respects:** `prefers-reduced-motion`

### Interaction
- **Button press:** `active:scale-[0.97]`
- **Hover transitions:** 150ms `transition-colors`
- **Header scroll:** 300ms `transition-all` (transparency to solid)
- **Mobile menu slide:** 200ms ease-out from right

---

## 11. Layout Patterns

### Navigation (Web)
- **Desktop:** Sticky header, logo left, nav links + icons right
- **Mobile:** Logo left, hamburger right, slide-out drawer
- **Homepage:** Transparent header that becomes solid white on scroll
- **Other pages:** Solid white/warm background

### Navigation (Mobile App)
- **Bottom tabs:** 5 items - Ontdekken, Reserveringen, + (create), Berichten, Profiel
- **Create button:** Raised green circle (52px), centered, floats above tab bar
- **Tab colors:** Active Brand 500, Inactive Warm 500

### Content Layout
- **Cards:** Full-width on mobile, 2-3 column grid on desktop
- **Forms:** Full-width inputs, stacked vertically
- **Detail pages:** Image top, content below, sticky action bar at bottom (mobile)

### Footer
- **4-column grid:** Brand + social, Navigation, Info links, Newsletter
- **Bottom bar:** Copyright left, legal links right

---

## 12. Responsive Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| Default | 0px+ | Single column, mobile-first |
| `sm` | 640px+ | 2-column grids, show desktop nav text |
| `md` | 768px+ | 3-column grids |
| `lg` | 1024px+ | Full desktop layout, split-pane messaging |

---

## 13. Platform-Specific Notes

### Web (Next.js)
- CSS: Tailwind CSS 4.1 with custom `@theme` variables
- Font loading: `next/font/google` with `display: swap`
- Images: `next/image` with WebP optimization

### Mobile (Expo/React Native)
- Styling: NativeWind (Tailwind for React Native)
- Icons: `@expo/vector-icons` (Ionicons)
- Font: Nunito via `expo-font` (700 Bold, 800 ExtraBold)
- Safe areas: `react-native-safe-area-context`

### Admin
- Same design system as web
- Sidebar: Dark background (`#1e1b2e`), white text
- Sidebar active: `#353150` background

---

## 14. Accessibility

- **Color contrast:** All text meets WCAG AA minimum (4.5:1 for normal text)
- **Focus states:** 2px Brand 300 ring with offset
- **Motion:** Respects `prefers-reduced-motion` media query
- **Language:** `lang="nl"` on HTML element
- **Labels:** All interactive elements have accessible labels
- **Touch targets:** Minimum 44px on mobile

---

## 15. File Locations

| Asset | Path |
|-------|------|
| Web colors | `apps/web/src/app/globals.css` |
| Tailwind preset | `packages/config/tailwind/index.ts` |
| Mobile config | `apps/mobile/tailwind.config.js` |
| Theme export | `packages/ui/src/theme.ts` |
| Logo (web) | `apps/web/public/logo.png` |
| Logo (mobile) | `apps/mobile/assets/images/logo.png` |
| Favicon | `apps/web/public/favicon.png` |
| Hero video | `apps/web/public/hero.mp4` |

---

*Last updated: April 2026*
*Kliekjesclub.nl - Samen tegen voedselverspilling.*
