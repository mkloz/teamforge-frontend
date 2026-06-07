# TeamForge — Visual Style Guide

**Version 1.0 | For Design, Marketing & Development Teams**

---

## 1. Color System

The palette has two layers:

1. **Core identity colors**: Forge Teal, Spark Amber, Ink, and near-white/near-black neutrals.
2. **Semantic surface tokens**: background, canvas, card, input, border, muted, and sidebar values tuned for light and dark mode.

Do not introduce new hue families without explicit approval. When a new surface value is needed, add it as a semantic token instead of hard-coding component colors.

### Primary Palette

| Role | Name | Light | Dark | CSS Token | Usage |
| --- | --- | --- | --- | --- | --- |
| Brand primary | Forge Teal | `#0D9488` | `#0D9488` | `--color-forge-teal` | Active states, icons, progress, selected states, teal tints |
| Solid action teal | Deep Teal | `#0F766E` | `#0D9488` | `--primary` | Solid semantic primary surfaces where text contrast matters |
| Accent | Spark Amber | `#F59E0B` | `#FBBF24` | `--accent`, `--color-spark-amber` | Notification badges, trust score value, group-formed flash, highlights |
| Primary text | Ink | `#1C1F1D` | `#F2F5F1` | `--color-ink`, `--foreground` | Headings and body text |
| Secondary text | Slate | `#68756F` | `#A4B2AC` | `--color-slate-muted`, `--muted-foreground` | Captions, timestamps, secondary labels, placeholder text |

### Surface Palette

| Role | Light | Dark | CSS Token | Usage |
| --- | --- | --- | --- | --- |
| App background | `#F1F4F1` | `#0B0F0E` | `--background` | Body background and floating nav bases |
| Canvas | `#F7F8F4` | `#111716` | `--canvas`, `--color-canvas` | Main page and long-session reading surfaces |
| Card / popover | `#FFFEFA` | `#18201E` | `--card`, `--popover` | Cards, overlays, menus, elevated panels |
| Input | `#EEF2ED` | `#202927` | `--input` | Text fields, selects, radios, OTP slots, tactile controls |
| Muted | `#E7EBE6` | `#202725` | `--muted` | Skeletons, inactive pills, hover surfaces |
| Border | `rgba(29, 38, 35, 0.11)` | `rgba(229, 239, 234, 0.11)` | `--border` | Dividers, card outlines, rail separation |

### Palette Rules

- Teal and Amber occupy a maximum of 15% of any screen surface. The remaining 85% is semantic neutrals.
- Amber is **never** used on large surfaces, backgrounds, or text blocks.
- Do not invent one-off teal or amber values in components. Use `--color-forge-teal`, `--primary`, `--accent`, or opacity modifiers.
- Avoid pure `#FFFFFF` or `#000000` for broad surfaces. Use the semantic surface tokens.

### Color Emotion Reference

| Color       | Association                    | Why it works for TeamForge                                                            |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| Forge Teal  | Trust, growth, intelligence    | Bridges blue (credibility) and green (vitality); unclaimed in the social app category |
| Spark Amber | Energy, warmth, transformation | Marks the forge moment — when the algorithm fires and a group is born                 |
| Canvas      | Porcelain, approachability, calm | Cleaner than cream; keeps long app sessions warm without turning beige              |
| Ink         | Authority, readability         | Green-black charcoal reads more naturally than pure black on Canvas                   |
| Slate       | Neutrality, hierarchy          | Recedes behind Teal and Amber; creates text hierarchy without a new hue               |

---

## 2. Typography

A single font family is used throughout. This is a non-negotiable rule — it ensures visual cohesion across 8+ screen types without fragmentation.

### Font Family

**Plus Jakarta Sans** - a contemporary screen-first sans with generous geometry, strong headings, and a warmer social-product feel than a default system face.

```
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap");
```

CSS token: `--font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;`

### Type Scale

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

| Token   | Value | Usage                                 |
| ------- | ----- | ------------------------------------- |
| `p-4`   | 16px  | Standard card internal padding        |
| `p-6`   | 24px  | Large card / section internal padding |
| `gap-3` | 12px  | Between cards in a row                |
| `gap-6` | 24px  | Between sections within a page        |
| `py-24` | 96px  | Section vertical padding (desktop)    |
| `py-16` | 64px  | Section vertical padding (mobile)     |

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

| Breakpoint       | Prefix | Width    |
| ---------------- | ------ | -------- |
| Mobile (default) | —      | < 768px  |
| Tablet           | `md:`  | ≥ 768px  |
| Desktop          | `lg:`  | ≥ 1024px |
| Wide             | `xl:`  | ≥ 1280px |

---

## 4. Border Radius

Consistent rounding is one of the primary signals of the brand's "Structured Warmth" aesthetic.

| Context                    | Radius | Tailwind class |
| -------------------------- | ------ | -------------- |
| Page cards / section cards | 16px   | `rounded-2xl`  |
| Input fields               | 10px   | `rounded-xl`   |
| Tag pills / badges         | Full   | `rounded-full` |
| Avatar images              | Full   | `rounded-full` |
| Modal / large overlay      | 20px   | `rounded-3xl`  |

**Never use sharp corners** (i.e., `rounded-none`) on user-facing cards, buttons, or inputs. Sharp corners communicate coldness. Fully circular containers (`rounded-full`) are reserved for avatars and pill badges only.

---

## 5. Shadows & Elevation

| Level                   | CSS Value                          | Usage                           |
| ----------------------- | ---------------------------------- | ------------------------------- |
| Resting card            | `0 1px 3px rgba(0,0,0,0.06)`       | Default card on white           |
| Hover card              | `0 4px 12px rgba(13,148,136,0.10)` | Card on hover (teal-tinted)     |
| Floating element        | `0 20px 40px rgba(0,0,0,0.12)`     | Glass cards, modals, dropdowns  |
| Teal glow (CTA buttons) | `0 0 20px rgba(13,148,136,0.30)`   | Primary button on dark surfaces |
| Teal glow pulse         | `0 0 32px rgba(13,148,136,0.55)`   | Animated max state              |

---

## 6. Glass Card Style

Used exclusively on dark backgrounds (hero, algorithm, CTA sections).

```css
background: rgba(255, 255, 255, 0.06);
border: 1px solid rgba(255, 255, 255, 0.1);
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

| Section      | Background                     | Purpose               |
| ------------ | ------------------------------ | --------------------- |
| Navbar       | Transparent → `#090909`        | Seamless              |
| Hero         | `#090909` + animated nodes     | Immersive — the "wow" |
| How It Works | Canvas `#F7F8F4`               | Clear, instructional  |
| Features     | Card `#FFFEFA`                 | Scannable, energetic  |
| Algorithm    | `#090909` + interactive viz    | Proof of intelligence |
| About        | Canvas `#F7F8F4` + Card surfaces | Warm, human         |
| CTA          | `#090909` + spotlight          | Dramatic, urgent      |
| Footer       | `#090909`                      | Minimal, complete     |

This pattern must be maintained when new sections are added. A light section should never immediately follow another light section without a dark break.

---

## 9. Animation Principles

### Motion Philosophy

Animations communicate intelligence and delight — they are never decorative. Every animation has a reason.

### Entrance Animations

All scroll-triggered entrances use **fade-up** (`opacity: 0 → 1`, `translateY: 24px → 0`):

```css
@keyframes fade-up {
    from {
        opacity: 0;
        transform: translateY(24px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

- Duration: 0.6s
- Easing: `ease-out`
- Stagger between sibling elements: 100–150ms

### Interaction Animations

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

### Accessibility

All animations must respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## 10. Component Patterns

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
- **In-app spot illustrations:** Empty states, error states, 404 visuals, Forge success art, and home hero-right visuals follow `docs/ui-visual-assets-reference-for-chat.md`. Use the approved TeamForge dark 2D outline style there, including its exact prompt examples.
- **Landing/decorative illustrations:** Use sparse, geometric, low-detail illustrations aligned with the node-graph motif. Teal and amber only.
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

_For brand concept, mission, values, and logo usage rules — see `brand-overview.md`._
```
