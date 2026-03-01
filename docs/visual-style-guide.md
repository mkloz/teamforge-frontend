# TeamForge — Visual Style Guide

**Version 1.0 | For Design, Marketing & Development Teams**

---

## 1. Color System

The palette uses exactly **5 roles**. No additional colors may be introduced without explicit approval.

### Primary Palette

<<<<<<< HEAD
| Role            | Name        | Hex       | CSS Token             | Usage                                                                                  |
| --------------- | ----------- | --------- | --------------------- | -------------------------------------------------------------------------------------- |
| Brand primary   | Forge Teal  | `#0D9488` | `--color-forge-teal`  | Primary buttons, active nav, borders, icons, progress rings, selected states           |
| Accent          | Spark Amber | `#F59E0B` | `--color-spark-amber` | Notification badges, trust score value, group-formed flash, highlights — use sparingly |
| Page background | Canvas      | `#FAFAF8` | `--color-canvas`      | Light-section page background, onboarding screens                                      |
| Primary text    | Ink         | `#1C1C1A` | `--color-ink`         | All headings and body text on light surfaces                                           |
| Secondary text  | Slate       | `#6B7280` | `--color-slate-muted` | Captions, timestamps, secondary labels, placeholder text, borders                      |

### Contextual Tokens (Dark Surfaces Only)

| Role                                | Name       | Hex       | Usage                                                                                                          |
| ----------------------------------- | ---------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| Hero / dark section background      | Void       | `#090909` | Hero, algorithm, CTA sections — dark-mode canvas                                                               |
=======
| Role | Name | Hex | CSS Token | Usage |
|---|---|---|---|---|
| Brand primary | Forge Teal | `#0D9488` | `--color-forge-teal` | Primary buttons, active nav, borders, icons, progress rings, selected states |
| Accent | Spark Amber | `#F59E0B` | `--color-spark-amber` | Notification badges, trust score value, group-formed flash, highlights — use sparingly |
| Page background | Canvas | `#FAFAF8` | `--color-canvas` | Light-section page background, onboarding screens |
| Primary text | Ink | `#1C1C1A` | `--color-ink` | All headings and body text on light surfaces |
| Secondary text | Slate | `#6B7280` | `--color-slate-muted` | Captions, timestamps, secondary labels, placeholder text, borders |

### Contextual Tokens (Dark Surfaces Only)

| Role | Name | Hex | Usage |
|---|---|---|---|
| Hero / dark section background | Void | `#090909` | Hero, algorithm, CTA sections — dark-mode canvas |
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829
| Teal light (single allowed variant) | Teal Light | `#14B8A6` | One lighter teal variant; allowed only for gradients and secondary spectrum bars. **Not a sixth brand color.** |

### Palette Rules

- Teal and Amber occupy a maximum of 15% of any screen surface. The remaining 85% is neutrals.
- Amber is **never** used on large surfaces, backgrounds, or text blocks.
- `#14B8A6` is permitted only as a gradient endpoint alongside `#0D9488`. It must not appear as a standalone fill on interactive elements.
- Never create additional teal hex variants (e.g., `#0f766e`, `#0a6460`). Use opacity modifiers on `#0D9488` instead.

### Color Emotion Reference

<<<<<<< HEAD
| Color       | Association                    | Why it works for TeamForge                                                            |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| Forge Teal  | Trust, growth, intelligence    | Bridges blue (credibility) and green (vitality); unclaimed in the social app category |
| Spark Amber | Energy, warmth, transformation | Marks the forge moment — when the algorithm fires and a group is born                 |
| Canvas      | Paper, approachability, calm   | Warmer than pure white; reduces screen fatigue for a Gen Z audience                   |
| Ink         | Authority, readability         | Warm charcoal reads more naturally than pure black on Canvas                          |
| Slate       | Neutrality, hierarchy          | Recedes behind Teal and Amber; creates text hierarchy without a new color             |

### Dark Mode Mapping

| Light token           | Dark equivalent                                     |
| --------------------- | --------------------------------------------------- |
| Canvas `#FAFAF8`      | Void `#090909` or `#141413`                         |
| White card `#FFFFFF`  | `#1C1C1A`                                           |
| Ink `#1C1C1A`         | Off-white `#EDEDED`                                 |
| Forge Teal `#0D9488`  | Teal Light `#14B8A6` (for contrast against dark bg) |
| Spark Amber `#F59E0B` | `#FBBF24` (one step lighter)                        |
=======
| Color | Association | Why it works for TeamForge |
|---|---|---|
| Forge Teal | Trust, growth, intelligence | Bridges blue (credibility) and green (vitality); unclaimed in the social app category |
| Spark Amber | Energy, warmth, transformation | Marks the forge moment — when the algorithm fires and a group is born |
| Canvas | Paper, approachability, calm | Warmer than pure white; reduces screen fatigue for a Gen Z audience |
| Ink | Authority, readability | Warm charcoal reads more naturally than pure black on Canvas |
| Slate | Neutrality, hierarchy | Recedes behind Teal and Amber; creates text hierarchy without a new color |

### Dark Mode Mapping

| Light token | Dark equivalent |
|---|---|
| Canvas `#FAFAF8` | Void `#090909` or `#141413` |
| White card `#FFFFFF` | `#1C1C1A` |
| Ink `#1C1C1A` | Off-white `#EDEDED` |
| Forge Teal `#0D9488` | Teal Light `#14B8A6` (for contrast against dark bg) |
| Spark Amber `#F59E0B` | `#FBBF24` (one step lighter) |
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829

---

## 2. Typography

A single font family is used throughout. This is a non-negotiable rule — it ensures visual cohesion across 8+ screen types without fragmentation.

### Font Family

**Inter** — designed for screens, open apertures, tall x-height, legible at every size.

```
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
```

CSS token: `--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;`

### Type Scale

<<<<<<< HEAD
| Role              | Size                       | Weight          | Color         | Line Height | Class Pattern                                     |
| ----------------- | -------------------------- | --------------- | ------------- | ----------- | ------------------------------------------------- |
| Page / hero title | `clamp(2rem, 5vw, 3.5rem)` | 800 (ExtraBold) | Ink or White  | 1.1         | `font-extrabold leading-tight`                    |
| Section heading   | 32px / 2rem                | 700 (Bold)      | Ink           | 1.2         | `text-3xl font-bold`                              |
| Card title        | 20px / 1.25rem             | 600 (SemiBold)  | Ink           | 1.3         | `text-xl font-semibold`                           |
| Body text         | 16px / 1rem                | 400 (Regular)   | Ink or Slate  | 1.6         | `text-base font-normal leading-relaxed`           |
| Secondary body    | 14px / 0.875rem            | 400 (Regular)   | Slate         | 1.5         | `text-sm leading-relaxed`                         |
| Overline / label  | 11px / 0.6875rem           | 600 (SemiBold)  | Teal or Slate | 1.0         | `text-xs font-semibold uppercase tracking-widest` |
| Caption           | 12px / 0.75rem             | 500 (Medium)    | Slate         | 1.4         | `text-xs font-medium`                             |
| Button            | 14–16px                    | 600 (SemiBold)  | White or Teal | 1.0         | `text-sm font-semibold`                           |
=======
| Role | Size | Weight | Color | Line Height | Class Pattern |
|---|---|---|---|---|---|
| Page / hero title | `clamp(2rem, 5vw, 3.5rem)` | 800 (ExtraBold) | Ink or White | 1.1 | `font-extrabold leading-tight` |
| Section heading | 32px / 2rem | 700 (Bold) | Ink | 1.2 | `text-3xl font-bold` |
| Card title | 20px / 1.25rem | 600 (SemiBold) | Ink | 1.3 | `text-xl font-semibold` |
| Body text | 16px / 1rem | 400 (Regular) | Ink or Slate | 1.6 | `text-base font-normal leading-relaxed` |
| Secondary body | 14px / 0.875rem | 400 (Regular) | Slate | 1.5 | `text-sm leading-relaxed` |
| Overline / label | 11px / 0.6875rem | 600 (SemiBold) | Teal or Slate | 1.0 | `text-xs font-semibold uppercase tracking-widest` |
| Caption | 12px / 0.75rem | 500 (Medium) | Slate | 1.4 | `text-xs font-medium` |
| Button | 14–16px | 600 (SemiBold) | White or Teal | 1.0 | `text-sm font-semibold` |
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829

### Typography Rules

- Use `text-balance` on all headlines to prevent orphaned words.
- Use `text-pretty` on body copy blocks longer than 2 lines.
- Never use type smaller than 12px in any UI context.
- Line-height for body copy must always be between 1.4 and 1.6.
- Do not add custom letter-spacing to body text. Only overlines use `tracking-widest`.

---

## 3. Spacing & Layout

### Base Grid

All spacing uses a **4px base unit**. Prefer Tailwind's built-in scale; avoid arbitrary values.

<<<<<<< HEAD
| Token   | Value | Usage                                 |
| ------- | ----- | ------------------------------------- |
| `p-4`   | 16px  | Standard card internal padding        |
| `p-6`   | 24px  | Large card / section internal padding |
| `gap-3` | 12px  | Between cards in a row                |
| `gap-6` | 24px  | Between sections within a page        |
| `py-24` | 96px  | Section vertical padding (desktop)    |
| `py-16` | 64px  | Section vertical padding (mobile)     |
=======
| Token | Value | Usage |
|---|---|---|
| `p-4` | 16px | Standard card internal padding |
| `p-6` | 24px | Large card / section internal padding |
| `gap-3` | 12px | Between cards in a row |
| `gap-6` | 24px | Between sections within a page |
| `py-24` | 96px | Section vertical padding (desktop) |
| `py-16` | 64px | Section vertical padding (mobile) |
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829

### Container Width

```
max-w-6xl mx-auto px-6
```

This applies to all section content. Never break this to `max-w-none` for text content — only full-bleed backgrounds use `w-full`.

### Layout Priority

1. **Flexbox** for most layouts — rows, columns, centering, alignment.
2. **CSS Grid** for 2D bento layouts (features, about bento).
3. **Never use floats** or absolute positioning for layout structure.

### Responsive Breakpoints

<<<<<<< HEAD
| Breakpoint       | Prefix | Width    |
| ---------------- | ------ | -------- |
| Mobile (default) | —      | < 768px  |
| Tablet           | `md:`  | ≥ 768px  |
| Desktop          | `lg:`  | ≥ 1024px |
| Wide             | `xl:`  | ≥ 1280px |
=======
| Breakpoint | Prefix | Width |
|---|---|---|
| Mobile (default) | — | < 768px |
| Tablet | `md:` | ≥ 768px |
| Desktop | `lg:` | ≥ 1024px |
| Wide | `xl:` | ≥ 1280px |
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829

---

## 4. Border Radius

Consistent rounding is one of the primary signals of the brand's "Structured Warmth" aesthetic.

<<<<<<< HEAD
| Context                    | Radius  | Tailwind class |
| -------------------------- | ------- | -------------- |
| Page cards / section cards | 16px    | `rounded-2xl`  |
| Buttons                    | 10–12px | `rounded-xl`   |
| Input fields               | 10px    | `rounded-xl`   |
| Tag pills / badges         | Full    | `rounded-full` |
| Avatar images              | Full    | `rounded-full` |
| Modal / large overlay      | 20px    | `rounded-3xl`  |
=======
| Context | Radius | Tailwind class |
|---|---|---|
| Page cards / section cards | 16px | `rounded-2xl` |
| Buttons | 10–12px | `rounded-xl` |
| Input fields | 10px | `rounded-xl` |
| Tag pills / badges | Full | `rounded-full` |
| Avatar images | Full | `rounded-full` |
| Modal / large overlay | 20px | `rounded-3xl` |
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829

**Never use sharp corners** (i.e., `rounded-none`) on user-facing cards, buttons, or inputs. Sharp corners communicate coldness. Fully circular containers (`rounded-full`) are reserved for avatars and pill badges only.

---

## 5. Shadows & Elevation

<<<<<<< HEAD
| Level                   | CSS Value                          | Usage                           |
| ----------------------- | ---------------------------------- | ------------------------------- |
| Resting card            | `0 1px 3px rgba(0,0,0,0.06)`       | Default card on white           |
| Hover card              | `0 4px 12px rgba(13,148,136,0.10)` | Card on hover (teal-tinted)     |
| Floating element        | `0 20px 40px rgba(0,0,0,0.12)`     | Glass cards, modals, dropdowns  |
| Teal glow (CTA buttons) | `0 0 20px rgba(13,148,136,0.30)`   | Primary button on dark surfaces |
| Teal glow pulse         | `0 0 32px rgba(13,148,136,0.55)`   | Animated max state              |
=======
| Level | CSS Value | Usage |
|---|---|---|
| Resting card | `0 1px 3px rgba(0,0,0,0.06)` | Default card on white |
| Hover card | `0 4px 12px rgba(13,148,136,0.10)` | Card on hover (teal-tinted) |
| Floating element | `0 20px 40px rgba(0,0,0,0.12)` | Glass cards, modals, dropdowns |
| Teal glow (CTA buttons) | `0 0 20px rgba(13,148,136,0.30)` | Primary button on dark surfaces |
| Teal glow pulse | `0 0 32px rgba(13,148,136,0.55)` | Animated max state |
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829

---

## 6. Glass Card Style

Used exclusively on dark backgrounds (hero, algorithm, CTA sections).

```css
background: rgba(255, 255, 255, 0.06);
<<<<<<< HEAD
border: 1px solid rgba(255, 255, 255, 0.1);
=======
border: 1px solid rgba(255, 255, 255, 0.10);
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829
backdrop-filter: blur(12px);
border-radius: 16px;
```

**Do not use glassmorphism on light/cream backgrounds.** Glass only works when there is visible motion or color behind it to reveal through the blur.

---

## 7. Iconography

- **Library:** Lucide React (primary). React Icons as fallback for icons not available in Lucide.
- **Size:** 16px (inline), 20px (card), 24px (section header), 32px (large feature card).
- **Stroke weight:** `strokeWidth={1.5}` for 20–24px, `strokeWidth={2}` for 16px.
- **Color:** Forge Teal for primary icons; Spark Amber for accent/notification icons; Slate for inactive/secondary icons.
- **Never use emojis as icons** in any UI context.

---

## 8. Page-Level Visual Rhythm

The landing page follows a deliberate dark-light alternation that creates scroll momentum:

<<<<<<< HEAD
| Section      | Background                     | Purpose               |
| ------------ | ------------------------------ | --------------------- |
| Navbar       | Transparent → `#090909`        | Seamless              |
| Hero         | `#090909` + animated nodes     | Immersive — the "wow" |
| How It Works | Canvas `#FAFAF8`               | Clear, instructional  |
| Features     | White `#FFFFFF`                | Scannable, energetic  |
| Algorithm    | `#090909` + interactive viz    | Proof of intelligence |
| About        | Canvas `#FAFAF8` + White cards | Warm, human           |
| CTA          | `#090909` + spotlight          | Dramatic, urgent      |
| Footer       | `#090909`                      | Minimal, complete     |
=======
| Section | Background | Purpose |
|---|---|---|
| Navbar | Transparent → `#090909` | Seamless |
| Hero | `#090909` + animated nodes | Immersive — the "wow" |
| How It Works | Canvas `#FAFAF8` | Clear, instructional |
| Features | White `#FFFFFF` | Scannable, energetic |
| Algorithm | `#090909` + interactive viz | Proof of intelligence |
| About | Canvas `#FAFAF8` + White cards | Warm, human |
| CTA | `#090909` + spotlight | Dramatic, urgent |
| Footer | `#090909` | Minimal, complete |
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829

This pattern must be maintained when new sections are added. A light section should never immediately follow another light section without a dark break.

---

## 9. Animation Principles

### Motion Philosophy

Animations communicate intelligence and delight — they are never decorative. Every animation has a reason.

### Entrance Animations

All scroll-triggered entrances use **fade-up** (`opacity: 0 → 1`, `translateY: 24px → 0`):

```css
@keyframes fade-up {
<<<<<<< HEAD
    from {
        opacity: 0;
        transform: translateY(24px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
=======
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829
}
```

- Duration: 0.6s
- Easing: `ease-out`
- Stagger between sibling elements: 100–150ms

### Interaction Animations

<<<<<<< HEAD
| Interaction      | Animation                                             |
| ---------------- | ----------------------------------------------------- |
| Button hover     | Scale 1.02, shadow intensify, 150ms ease              |
| Card hover       | Border color → Teal, shadow → teal-tinted, 200ms ease |
| Tag/pill select  | Scale 0.95 then 1.0, background → Teal, 150ms ease    |
| Navigation hover | Underline slide-in from left, Teal, 200ms ease        |

### Background Animations

| Element              | Animation                                       | Notes                 |
| -------------------- | ----------------------------------------------- | --------------------- |
| Hero node canvas     | 64 nodes, sinusoidal drift, pulsing connections | canvas-based, low CPU |
| Orb ring             | `rotate 20s linear infinite`                    | CSS only              |
| Orb glow pulse       | `scale + opacity, 4s ease-in-out infinite`      | CSS only              |
| Floating glass cards | Independent sine-wave float, 3.5–5s cycles      | CSS only              |
=======
| Interaction | Animation |
|---|---|
| Button hover | Scale 1.02, shadow intensify, 150ms ease |
| Card hover | Border color → Teal, shadow → teal-tinted, 200ms ease |
| Tag/pill select | Scale 0.95 then 1.0, background → Teal, 150ms ease |
| Navigation hover | Underline slide-in from left, Teal, 200ms ease |

### Background Animations

| Element | Animation | Notes |
|---|---|---|
| Hero node canvas | 64 nodes, sinusoidal drift, pulsing connections | canvas-based, low CPU |
| Orb ring | `rotate 20s linear infinite` | CSS only |
| Orb glow pulse | `scale + opacity, 4s ease-in-out infinite` | CSS only |
| Floating glass cards | Independent sine-wave float, 3.5–5s cycles | CSS only |
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829

### Accessibility

All animations must respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
<<<<<<< HEAD
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
=======
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829
}
```

---

## 10. Component Patterns

### Primary Button

```
Forge Teal background (#0D9488)
White text, 14–16px / SemiBold
Height: 44–52px
Padding: 0 24px
Border-radius: rounded-xl (10–12px)
On dark: add teal glow shadow
On hover: scale(1.02), intensify shadow
```

### Ghost Button

```
Transparent background
Teal text (or white on dark)
1px Teal border (or white/30% on dark)
Same sizing as primary
On hover: Teal fill, white text transition
```

### Tag / Interest Pill

```
Resting: Slate/8% background, Slate text, rounded-full
Selected: Forge Teal background, white text, rounded-full
Height: 28–32px, Padding: 0 12px
Font: 12px / Medium
```

### MBTI Badge

```
Forge Teal background
White text, 11px / Bold / Uppercase
Rounded-full
Padding: 2px 8px
```

### Trust Score Ring

```
Outer ring track: Slate at 20% opacity
Fill ring: Forge Teal
Center value: Spark Amber text, font-bold
Ring size: 48–64px
SVG stroke-linecap: round
```

---

## 11. Imagery & Illustration

- **Photography:** Avoid generic stock photos. If photos are used, they must show real groups of 3–5 people doing activities. Warm, natural light. No posed corporate imagery.
- **Illustrations:** Use sparse, geometric, low-detail illustrations aligned with the node-graph motif. Teal and amber only.
- **Generated images:** May be used for brand mockups and presentation materials. Must match the Canvas/Teal/Amber palette.
- **Backgrounds:** Only the node-canvas animation is used as a background element. No gradient blobs, no abstract shapes, no decorative geometric fills.

---

## 12. Copy-Level Style Rules

- Avoid "AI", "machine learning", or any ML terminology — the algorithm does not use ML.
- Avoid dating-app language: "match", "swipe", "like", "heart".
- Avoid game mechanics language: "level up", "achievement", "leaderboard".
- Avoid jargon facing the user: "k-NN", "greedy matching", "cosine similarity", "Euclidean distance", "exponential smoothing".
- Use active, second-person copy: "your group", "your people", "you're an ENTJ".
- Numbers and stats must be real or clearly hypothetical. Never display placeholder stats as if live.

---

<<<<<<< HEAD
_For brand concept, mission, values, and logo usage rules — see `brand-overview.md`._
=======
*For brand concept, mission, values, and logo usage rules — see `brand-overview.md`.*
>>>>>>> 12a645afbd4c7c6f3006eaf45e9454e7c59fb829
