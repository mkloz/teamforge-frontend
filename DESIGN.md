---
name: TeamForge
description: A clear, human interface for turning compatible people into real plans.
colors:
  neutral-background: "#f4f4f2"
  neutral-canvas: "#fafafa"
  neutral-card: "#ffffff"
  neutral-ink: "#171717"
  quiet-copy: "#666666"
  input-surface: "#ececea"
  forge-teal: "#0f766e"
  signal-amber: "#956508"
  black-background: "#000000"
  black-canvas: "#080808"
  black-card: "#111111"
  white-ink: "#ffffff"
  dark-amber: "#ffbf00"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3vw, 2.5rem)"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.25
rounded:
  compact: "8px"
  control: "12px"
  raised-control: "16px"
  surface: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.forge-teal}"
    textColor: "{colors.neutral-card}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "44px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "44px"
  input:
    backgroundColor: "{colors.input-surface}"
    textColor: "{colors.neutral-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
    height: "44px"
  card:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.surface}"
    padding: "24px"
---

# Design System: TeamForge

## Overview

**Creative North Star: “The Clear Shared Workshop”**

TeamForge keeps the product's established component anatomy and layout. The
theme supplies a sharper, quieter visual character through semantic color,
controlled geometry, explicit borders, and purposeful interaction feedback.
The default dark environment is genuinely black; alternate purpose palettes
may use tinted near-black surfaces where that serves their stated need.

**Key Characteristics:**

- True black, white, neutral gray, teal, and amber define the default identity.
- Existing buttons, fields, navigation, and Appearance information architecture
  remain recognizable; the theme does not redesign product structure.
- Corners are restrained: 12px controls, 16px selected/raised controls, and
  about 20px for larger surfaces.
- Borders, tone, labels, and icons carry state; shadow is never the only cue.

## Colors

Balanced light uses neutral off-white at the application edge, white cards,
and dark neutral text. Balanced dark uses `#000000` for the application
background, then `#080808` canvas and `#111111` card layers for explicit depth.

### Primary

- **Forge Teal:** action, selection, and positive momentum. It may frame focus
  only when the control itself is already teal.
- The default dark action teal stays deep enough to support white action text.

### Secondary

- **Signal Amber:** warmth, attention, and controlled emphasis.
- It does not replace destructive, warning, or error semantics.

### Neutral

- **Neutral light:** off-white application ground, near-white canvas, white card.
- **True-black dark:** black application ground with small neutral elevation steps.
- **Quiet copy:** supporting gray text; never use disabled text for guidance.

**The Semantic Meaning Rule.** Palettes may change atmosphere, but action,
success, warning, error, information, and destructive roles keep their meaning.

## Typography

**Display and body font:** Inter, self-hosted variable WOFF2 with system sans
fallbacks.

Inter replaces the rejected expressive pairing. Personality now comes from
weight, scale, spacing, color, and the illustration voice rather than a visibly
stylized heading face. Headings are confident but not decorative; dense UI copy
remains compact and predictable.

Do not place a teal eyebrow, kicker, route name, or subtitle above a heading.
Remove redundant labels such as a page name repeated by its hero; render useful
context such as dates, progress, and section metadata in the neutral supporting
text role. Teal belongs to actions, selected states, semantic status, and
deliberate icon accents—not routine heading hierarchy.

## Layout

Use the existing route and component layout. The Appearance settings remain the
original single-column flow: live preview, mode, interface character, then
palette. Do not convert it into a dashboard, sticky configurator, or new card
architecture. Use the established responsive stacking and 4/8px spacing rhythm.

## Elevation & Depth

Primary actions and selected clickable surfaces use TeamForge's short mechanical
lift: a four-pixel rise exposes a hard, unblurred shadow, then settles on press.
The original compact press response remains part of that motion. Glossy sweeps
and glows do not. Fields remain flat at rest rather than adopting the lift.
Larger surfaces use restrained elevation only where hierarchy needs it. Reduced
effects removes decorative depth, blur, and motion while preserving structural
edges and focus visibility.

**The Three-Cue Rule.** Pair elevation with an edge, tonal difference, label, or
icon; never rely on shadow alone.

## Shapes

Standard buttons and fields are 44px high with 12px corners. Larger actions may
use 16px corners. Major product surfaces usually stop around 20px. Full pills
are reserved for search, small icon actions, filters, and status chips. Do not
spread pill or oversized-card geometry across ordinary controls.

## Components

### Buttons

- Preserve the established component, variants, and sizing.
- Primary buttons use a solid teal field and explicit 2px edge. Hover uses the
  short mechanical lift and a hard shadow; press returns the action to its
  resting plane. Outline buttons use the same physics while staying transparent
  and structural.
- Prefer lift/shadow, border strength, ink, or icon response before changing a
  control's fill. Background tint is the fallback for flat ghost controls and
  the primary cue only for persistent selected states.
- Ghost and link actions stay visually quiet.
- Keyboard focus on neutral controls uses a solid one-pixel foreground ring
  (near-black in light mode, white in dark mode) separated by a two-pixel
  background offset. Teal focus is reserved for controls already rendered in
  teal. Every focus treatment must read as an edge, never a glow.
- Disabled buttons preserve native and ARIA semantics; never communicate
  unavailability by color alone in surrounding UI.

### Cards / Containers

- Use semantic surfaces and a visible border where separation is needed.
- Avoid nesting decorative cards or increasing radius merely to imply polish.
- Keep padding aligned with existing route density.

### Inputs / Fields

- Preserve the existing 44px field height and 12px corner.
- Use the semantic input fill and border with no resting shadow. Hover strengthens
  the neutral border without changing the field fill or introducing accent color
  prematurely.
- Keyboard focus strengthens the field border in the foreground color and adds
  the same solid one-pixel foreground ring with a two-pixel background offset.
- Search remains the intentionally pill-shaped exception.

### Navigation

Navigation stays quiet at rest. Active destinations combine a selected surface,
clear label, and icon/position cue. Theme work must not alter navigation anatomy.

### Appearance Preview

The existing preview mirrors mode, palette, and interface-character changes.
It remains part of the original settings flow and does not become a new page or
sticky desktop workbench.

## Visual Asset Policy

Keep the established route-specific SVGs and semantic icon tiles. The supplied
editorial character image documents a possible future direction only; it does
not authorize replacing current product assets. A coherent illustration-family
integration requires a separate explicit request and route-by-route review.

## Do's and Don'ts

### Do:

- **Do** preserve existing UI anatomy while applying semantic themes.
- **Do** keep the Balanced dark application background exactly black.
- **Do** test focus, contrast, zoom, reduced motion, and every saved preference.
- **Do** preserve the established product assets until replacement is explicitly requested.

### Don't:

- **Don't** replace the Appearance page with a new information architecture.
- **Don't** use oversized radii, generic floating pills, glow, or glass as polish.
- **Don't** turn every palette into black; specialized palettes may retain their
  purpose-led low-light tint.
- **Don't** infer permission to integrate new assets from a stylistic reference.
