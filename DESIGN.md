# TeamForge Product Design Contract

This file is the compact visual contract for TeamForge product work. It gives
design and coding agents one stable entry point without replacing the detailed
guidance in `AGENTS.md` and `docs/`.

## Authority

Follow these sources in order:

1. `AGENTS.md` for product, architecture, copy, and validation constraints.
2. `docs/visual-style-guide.md` for the full token and component system.
3. `docs/ui-visual-assets-reference-for-chat.md` for in-app illustration
   language and generation prompts.
4. `docs/brand-overview.md` for brand character and voice.
5. `docs/redesign/<page>.md` for approved page-specific decisions.

External design systems and generic design skills are references only. They
cannot introduce new fonts, hue families, product language, or interaction
patterns that conflict with the sources above.

## Product Thesis

TeamForge turns an activity idea into a small group and a workable plan.
The interface should make the next useful action feel clear, grounded, and
social without becoming a feed, a dating product, or a game.

Brand character: **The Catalyst**. TeamForge helps form the group, then lets the
members take over.

Design direction: **Structured Warmth**.

- Structured: strong hierarchy, precise alignment, quiet surfaces, explicit
  state, and one obvious primary action.
- Warm: rounded geometry, activity-specific imagery, human copy, graphite
  rather than pure black, and porcelain rather than sterile white.
- Restrained: neutral surfaces dominate. Teal and amber carry meaning instead
  of decorating empty space.

The intended influence is **Vercel discipline, TeamForge warmth**: adopt
precision, neutral hierarchy, hairlines, and controlled spacing without
copying Vercel's typography, gradients, sharp developer-tool posture, or pure
black-and-white palette.

## Non-negotiable Tokens

Use semantic CSS tokens. Do not hard-code per-component substitutes.

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| App background | `#F1F4F1` family | `#0B0F0E` family | `--background` |
| Reading canvas | `#F7F8F4` family | `#111716` family | `--canvas` |
| Card / overlay | `#FFFEFA` family | `#18201E` family | `--card` |
| Input / tactile control | `#EEF2ED` family | `#202927` family | `--input` |
| Primary text | `#1C1F1D` family | `#F2F5F1` family | `--foreground` |
| Secondary text | `#68756F` family | `#A4B2AC` family | `--muted-foreground` |
| Brand / active | `#0D9488` | theme equivalent | `--color-forge-teal` |
| Solid primary action | `#0F766E` | theme equivalent | `--primary` |
| Attention / readiness | `#F59E0B` | `#FBBF24` | `--accent` |

Screen-level color target:

- 85% semantic neutrals
- 10% teal
- 5% amber

These are composition guides, not pixel quotas. Amber never becomes a large
surface. Teal does not tint every card. Pure `#000000` and `#FFFFFF` do not
replace the semantic surface ladder.

## Typography

- Use Inter exclusively through `--font-sans`.
- Use size, weight, spacing, and measure to create hierarchy; do not add a
  display or monospace family.
- Use sentence case for interface text.
- Headings use tight line-height and balanced wrapping.
- Body copy uses `1.4–1.6` line-height and `text-pretty` when it runs longer
  than two lines.
- UI text never renders below 12px.
- Prefer two strong heading lines over a narrow multi-line text wall.
- Use tabular figures for time, counts, trust values, and aligned numerical
  data.

## Spatial Grammar

- Use the 4px Tailwind spacing scale.
- Use tighter spacing inside one semantic unit and larger gaps between units.
- Default page cards use `rounded-2xl`; inputs use `rounded-xl`; large overlays
  use `rounded-3xl`; pills and avatars use `rounded-full`.
- Use hairlines and surface changes before shadows.
- Avoid nested card stacks. A surface should communicate one level of
  hierarchy.
- Use full-width or polarity-flipped sections only when they establish a real
  chapter or focal action.
- Desktop width should create useful simultaneous context, not stretched
  mobile columns.

## Visual Hierarchy

Every page or major state has:

1. One primary job.
2. One primary action.
3. A clear first reading path.
4. No more than one major visual anchor.
5. Supporting visuals only when they improve identity, state, explanation,
   orientation, atmosphere, or evidence.

Color alone never carries state. Icon, label, shape, position, or supporting
copy must make the meaning available without color.

## Visual Asset Roles

Before adding an image, assign it one role:

- **Identity:** avatar, group cover, activity media.
- **State:** empty, error, offline, pending, success.
- **Explanation:** plan flow, group formation factors, participation history.
- **Orientation:** time, place, progress, membership, current step.
- **Atmosphere:** one restrained visual anchor that reinforces the page job.
- **Evidence:** real activity or user-generated media.

If the asset has no role beyond filling space, do not add it.

### Choose the right medium

- Lucide: controls and structural icons.
- React/SVG/CSS: themable spot art, simple diagrams, empty/error visuals,
  progress, charts, and ambient linework.
- Imagegen: art-directed raster covers, editorial activity imagery, landing
  compositions, textured illustrations, and concept exploration.
- Licensed photography: only with verified provenance and an intentional crop.

Do not bake important interface copy into an image. Do not use fake product UI
inside authenticated app illustrations. Avoid generic stock photos, icon-pack
empty states, decorative blobs, glossy 3D objects, and unrelated patterns.

## Motion

- Motion explains state, continuity, progress, or cause and effect.
- Default interaction duration is 150–300ms.
- Animate transform and opacity where possible.
- Do not animate every card or add scroll effects to high-frequency product
  surfaces.
- Never block interaction while animation runs.
- Preserve a complete `prefers-reduced-motion` experience.

## Interaction and Accessibility Floor

- Use native controls or the existing Radix/shadcn primitives.
- Keep visible focus indicators.
- Keep touch targets practical, normally at least 44px on touch layouts.
- Icon-only controls need accessible names.
- Forms use visible labels and local recovery guidance.
- Route changes, dialogs, drawers, and validation preserve sensible focus.
- Loading, empty, error, offline, pending, disabled, success, and populated
  states are designed deliberately when the surface can enter them.
- Normal text contrast meets WCAG AA in every supported theme.

## Page Redesign Method

Redesign one bounded section at a time and complete the page as a coherent
journey.

1. Define the page job, primary action, hierarchy, and supported states.
2. Capture a rendered baseline at mobile, laptop, and wide desktop.
3. Identify whether the problem is hierarchy, copy, layout, interaction, or
   visual coverage before creating assets.
4. Explore two or three controlled compositions using real product content.
5. Approve one direction and document the page-specific decisions.
6. Implement using existing primitives and semantic tokens.
7. Verify light/dark behavior, responsive layouts, keyboard/focus, reduced
   motion, async states, and relevant static checks.
8. Record the evidence in `docs/redesign/<page>.md`.

A page may be marked **Redesigned** only when every item in
`docs/redesign/README.md` is supported by current evidence. “Implemented”,
“looks good”, and “tests pass” are not equivalent to Redesigned.

