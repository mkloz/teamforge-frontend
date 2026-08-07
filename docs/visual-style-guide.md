# TeamForge visual style guide

This guide records durable product-wide visual decisions. Semantic tokens and
shared components in `src/` are the implementation source of truth.

## Design character

TeamForge is a clear shared workshop: calm, social, and practical. Theme work
preserves the established UI anatomy and uses restrained geometry, layered
neutral surfaces, explicit borders, and deliberate interaction feedback.

- Keep most of the screen neutral. Teal identifies action and positive momentum;
  ember adds warmth or controlled urgency.
- Prefer one meaningful surface to nested boxes.
- Use explicit borders, labels, and state icons in addition to elevation.
- Keep movement short and spatial. Respect both operating-system reduced motion
  and the in-app Reduced effects profile.
- Compose compact layouts intentionally; do not preserve empty desktop rails.

## Semantic color contract

Components consume roles, not palette colors. Do not add component-specific hex
values when a semantic role exists.

| Role | Tokens |
| --- | --- |
| Application | `--background`, `--canvas` |
| Surfaces | `--card`, `--popover`, `--surface-raised`, `--surface-inset`, `--surface-selected`, `--surface-interactive` |
| Text | `--foreground`, `--ink`, `--text-secondary`, `--slate-muted`, `--text-disabled` |
| Structure | `--border`, `--divider`, `--input-border`, `--focus` |
| Actions | `--primary`, `--secondary`, `--accent`, `--destructive` and their foreground pairs |
| Feedback | `--success`, `--warning`, `--warning-text`, `--error`, `--info` and their foreground pairs |
| Data | `--chart-1` through `--chart-5` |
| Illustration | Existing route-specific SVGs and semantic icon tiles; future illustration tokens remain reserved |

Balanced light uses neutral off-white, white, and quiet gray. Balanced dark uses
an exact `#000000` application background with `#080808` and `#111111` surface
steps. Specialized palettes may use tinted low-light neutrals when their purpose
requires it. Primary text, muted text, borders, shadows, semantic feedback, and
illustration backgrounds are recalculated for each mode.

## Purpose palettes

Every palette implements the same semantic contract in light and dark.

| Palette | User need | Personality |
| --- | --- | --- |
| Balanced | Everyday use | True black, clean neutrals, teal, measured amber |
| Quiet focus | Calm, low-stimulation sessions | Sage-neutral layers and muted accents |
| Warm social | Welcoming, expressive use | Clay warmth with grounded teal and richer ember |
| Clear contrast | Faster scanning and readability | Crisp separation and high-clarity signals |
| Night ease | Comfortable low-light use | Cooler blue-charcoal depth and soft amber |

Legacy palette values and invalid local or account-backed values are normalized
to a supported choice before they reach the UI.

## Typography

- Display, heading, interface, and body face: **Inter**, variable weights 400–900.
- Inter is a self-hosted WOFF2 file with `font-display: swap`, preloaded for
  first paint, and backed by system sans-serif fallbacks.
- Headings use tight but not compressed tracking and balanced wrapping.
- Body copy uses comfortable line height and pretty wrapping.
- Product text must not be smaller than 12px unless it is a nonessential mark in
  a contained preview.
- Do not use teal eyebrow labels, kickers, route names, or subtitles to decorate
  headings. Remove labels that repeat the heading; keep useful dates, progress,
  and section metadata neutral. Reserve teal text for interactive, selected, or
  semantic information.

## Shape, depth, and controls

- Comfortable profile: 12px base radius and 44px controls.
- Compact profile: 8px base radius and 40px controls.
- High contrast: stronger structural edges and focus indicators.
- Reduced effects: removes decorative elevation and blur, collapses animation
  and transition duration, and preserves structural edges and focus visibility.
- Primary buttons and appropriate clickable surfaces use a short mechanical lift:
  a four-pixel rise exposes a hard, unblurred shadow, and press returns the
  control to its resting plane with the established compact press response.
  Glossy sweeps and glows are not part of the language. Ghost and link actions
  stay deliberately quiet.
- Choose interaction cues in this order: mechanical lift for primary clickable
  surfaces; stronger edge, ink, or icon response for quieter controls; background
  tint only when a flat ghost control needs it or a selected state must persist.
- Fields are flat at rest. Hover strengthens a neutral edge; teal does not appear
  on a neutral field merely because a pointer or keyboard reaches it.
- Keyboard focus on neutral controls uses a solid one-pixel foreground ring—
  near-black in light mode and white in dark mode—separated by a two-pixel
  background offset. Teal focus is limited to controls already rendered in teal.
  Every focus indicator should read as a crisp drawn edge, never a blurred halo.
- Shared controls keep a visible focus indicator. Never remove focus without an
  equivalent replacement.
- Disabled controls retain native and ARIA semantics; adjacent copy or icons
  must explain consequential unavailability rather than relying on opacity.

## Visual assets

The supplied editorial image is a reference for future asset work, not an
authorization to replace current product visuals. Product states currently keep
their established route-specific SVGs and semantic icon tiles. Any future
illustration-family integration requires a separate explicit implementation
request and route-by-route review.

## Appearance settings

Appearance separates three decisions:

1. **Mode:** System, Light, or Dark.
2. **Palette:** the five purpose-led visual environments above.
3. **Comfort:** Comfortable, Compact, High contrast, or Reduced effects.

Changes apply optimistically and update the existing functional preview.
The original single-column Appearance sequence—preview, mode, interface
character, palette—remains unchanged. Preferences are
stored locally for startup and sent through account settings for cross-device
support. Reset returns to System, Balanced, and Comfortable. A synchronous boot
script sanitizes saved values and applies the resolved theme before React to
prevent an incorrect-theme flash.

### Compatibility contract

The user-facing labels and persisted identifiers are intentionally separate:

| UI label | Internal ID |
| --- | --- |
| Balanced | `graphite` |
| Quiet focus | `forge` |
| Warm social | `ember` |
| Clear contrast | `mono` |
| Night ease | `harbor` |
| Comfortable | `classic` |
| Compact | `ink` |
| High contrast | `poster` |
| Reduced effects | `glass` |

Local storage uses `teamforge:appearance:v2`, version `2`, with defaults
`system` / `graphite` / `classic`. Legacy mappings are
`acid|cobalt|ultraviolet → mono`, `coral → ember`, `paper → graphite`, and
`spruce → forge`. The supported sets, defaults, version, and migration table in
`src/shared/constants/theme-preferences.ts` and `public/theme-boot.js` must stay
in lockstep because the boot file runs before the application bundle. The
version is explicit in the runtime snapshot and encoded in the boot storage key;
the boot script does not parse a separate version field.

## States and responsive behavior

- Empty states explain what is absent and suggest the next useful action.
- Errors preserve user work, avoid blame, and pair recovery copy with a specific
  action.
- Success is quiet and informative rather than confetti-heavy.
- Offline states explain what remains available and what needs reconnection.
- Appearance settings retain the established single-column flow at every
  breakpoint, with internal option grids adapting without horizontal overflow.
- Sticky and fixed regions must respect safe areas and never obscure content.

## Verification gate

For each meaningful visual milestone:

1. Implement one coherent portion.
2. Capture affected routes, states, themes, and breakpoints.
3. Compare hierarchy, wrapping, overflow, and theme behavior.
4. Exercise the realistic scenario and keyboard path.
5. Run lint, types, Axe, contrast sampling, and Scenario Mode.
6. Fix the highest-impact issue and repeat.

Generated screenshots and audit artifacts belong in ignored `temp/` or
`reports/` directories.
