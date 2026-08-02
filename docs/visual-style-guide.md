# TeamForge visual style guide

This guide records the durable product UI decisions used across TeamForge. The
semantic tokens and shared components in `src/` remain the implementation
source of truth. Update this guide when a repeated product-wide decision
changes; do not add one-off page instructions here.

## Design character

TeamForge is compact, calm, social, and image-aware. It should feel crafted for
forming real groups, not like a generic dashboard, database viewer, or a stack
of generated cards.

- Lead with content and user actions.
- Use hierarchy, imagery, and composition before adding containers.
- Prefer a few meaningful surfaces over nested boxes.
- Keep density comfortable but purposeful; large empty gaps are not luxury.
- Make mobile a composed layout, not a collapsed desktop afterthought.
- Use color and icons as signals, not decoration.

## Color and surfaces

Use semantic theme tokens. TeamForge supports multiple palettes and surface
styles; components must not hard-code the default Forge palette.

| Role | Token | Default dark intent |
| --- | --- | --- |
| Page | `--background` | Deepest application surface |
| Reading canvas | `--canvas` | Long-session content surface |
| Card/popover | `--card`, `--popover` | Dark contained surface; default dark-surface value `#131615` |
| Input | `--input` | Slightly differentiated, low-contrast control surface |
| Border | `--border`, `--input-border` | Quiet structural edge |
| Primary | `--primary`, `--color-forge-teal` | Selection, progress, primary action |
| Accent | `--accent`, `--color-spark-amber` | Warnings and limited emphasis |
| Text | `--foreground`, `--muted-foreground` | Primary and secondary hierarchy |

Rules:

- Use neutrals for most of the screen. Teal, amber, and theme accents identify
  state or action.
- Do not invent component-specific shades when a semantic token exists.
- Dark-mode cards should not become brighter than the content hierarchy needs.
- Selection normally uses a restrained tinted background and clear state icon,
  not bright text plus border plus glow at the same time.
- Use destructive red only for destructive state and actions.
- Never rely on color alone to communicate status.

## Typography

Use the configured Inter stack for product UI. Establish hierarchy through
size, weight, measure, and spacing rather than uppercase labels or many similar
headings.

| Role | Typical treatment |
| --- | --- |
| Page title | `clamp(2rem, 5vw, 3.5rem)`, 800, tight line-height |
| Section title | 1.5–2rem, 700 |
| Item title | 1–1.25rem, 600–700 |
| Body | 1rem, 400, 1.45–1.6 line-height |
| Secondary | 0.875rem, muted, 1.4–1.5 line-height |
| Caption/status | 0.75rem minimum, 500–600 |

- Use sentence case by default, including settings section labels.
- Keep headings visually distinct from field labels and item titles.
- Avoid headings that wrap into narrow vertical towers. Adjust measure and size
  together.
- Use `text-balance` selectively on short headings and `text-pretty` on longer
  supporting copy.
- Do not add letter spacing to body text.
- Never render product text below 12px.
- Clamp only when the omitted content remains available or nonessential.

## Spacing and page width

Use the 4px Tailwind scale and shared layout primitives. Choose spacing from the
relationship between elements rather than applying one global section gap.

| Relationship | Typical range |
| --- | --- |
| Icon to label | 8–12px |
| Rows inside a compact group | 2–8px visual gap, owned by the shared component |
| Related controls/fields | 12–20px |
| Section heading to content | 16–24px |
| Product sections | 32–56px depending on hierarchy |
| Marketing chapters | 64–96px only when the composition benefits |

- Avoid blanket `py-16`/`py-24` product sections.
- Reduce outer and inner padding when a boxed child sits inside a boxed parent,
  especially on mobile.
- Constrain forms and settings content so fields do not stretch across wide
  screens. Use the remaining width for previews, maps, context, or intentional
  whitespace.
- Let editorial and bento surfaces use wider containers when their composition
  needs it; long text still needs a readable measure.
- Use gaps for sibling separation. Do not combine margin and gap for the same
  relationship.

## Grouping and separators

Use the shared grouped-menu pattern for related rows.

- Separate rows with the component's narrow background gap instead of a bright
  border.
- Use the shared `grouped-surface` utility for these gutters. It owns the
  canonical 2px width and remains transparent so the parent surface—not an
  arbitrary black fill—shows between items.
- Round the first row at the top and the last row at the bottom. Middle rows do
  not receive independent outer rounding.
- A single row receives the full group radius.
- Do not let dividers or background gaps stop midway through a component unless
  the indentation communicates a real nested hierarchy.
- Keep the item's content aligned across rows; descriptions should not inherit
  icon indentation when the icon is meant to read inline.

Prefer an unboxed section, grouped menu, timeline, editorial split, or image
mosaic when cards would create box-in-box repetition.

## Radius and borders

Radius belongs to the component family, not to every child.

| Context | Typical radius |
| --- | --- |
| Product surface/group | 12–16px |
| Input/control | 10–14px |
| Modal/drawer panel | 16–20px |
| Avatar/pill/compact status | Full |

- Borders are quiet structural aids, not the default way to separate every
  region.
- Empty states may use a complete low-contrast dashed border with a modest
  radius; never show only horizontal dashed lines.
- Selected or profile-ranked visual emphasis may use a stronger 2px semantic
  border when it must remain visible over imagery.
- Avoid multiple borders around nested surfaces.

## Icons

Use Lucide React unless an existing domain asset is more specific.

- Inline icon: 16px. Row icon: 18–20px. Section icon: 20–24px.
- Align inline icons to the text baseline so they read like another character.
- Unboxed icons inherit adjacent text color.
- Accent-colored icons require semantic meaning or an intentional icon
  background. Do not color every icon teal.
- Do not add an icon background to ordinary toolbar, filter, or inline actions.
- Keep icon backgrounds when they are part of a repeated identity/status block;
  match the block's height and alignment.
- Prefer a specific icon over repeating shield, sparkles, or generic group
  symbols everywhere.
- Use a checkmark in the usual icon position for selected visual choices when
  the source icon would otherwise duplicate the selection marker.
- Do not use emoji as product icons.

## Components and data presentation

### Inputs

- Use a dark, subdued input surface and low-contrast border in dark mode.
- Keep right-side controls optically balanced with field radius.
- Animate search and clear controls spatially; do not let them pop in and shift
  text abruptly.
- Keep validation close to the field without collapsing the space needed for
  helper text.

### Buttons

- One clear primary action per decision area.
- Secondary actions use the established secondary button, not improvised pills.
- Icon-only actions need tooltips and accessible names.
- Destructive actions should be nearby but visually separate from the primary
  continuation path.
- Avoid full-width desktop buttons when the action does not need that emphasis.

### Notices and states

- Use the shared notice with a generic semantic icon for error, warning, and
  success unless a specific symbol materially improves comprehension.
- Do not place the notice icon inside an extra box.
- Empty states explain what is absent and, when useful, the next action. Avoid
  decorative custom SVGs that become illegible at their rendered size.
- Design loading, empty, error, success, disabled, restricted, missing-media,
  dense, long-copy, and pagination states as first-class states.

### Data-rich surfaces

- Avoid database-like rows when time, place, capacity, or progress can be shown
  more naturally through a calendar tile, map image, countdown, segmented
  capacity track, timeline, or member slots.
- Remove duplicate labels when icon, value, and context are already clear.
- Preserve important values such as match/trust scores and member availability
  during visual refactors.
- Use the reusable bento/activity mosaic for image-rich recommendations where
  varied sizes improve discovery. The grid must close cleanly at its edge.

## Imagery and material

- Prefer relevant photography showing real people doing the activity. Avoid
  posed corporate stock imagery.
- Use consistent crop logic and focal points across a repeated component.
- Add explicit online markers when location imagery could imply an in-person
  activity.
- Missing and failed images need intentional fallbacks.
- Use a restrained scrim or localized glass surface for text over images. Avoid
  black gradients that erase most of the image.
- Glass requires visible content behind it, readable contrast, modest blur, and
  a clear purpose. Do not apply it as a universal card style.
- Do not use blur as a transition.

## Motion and interaction

Motion explains where content came from and what changed.

- Animate shared collapsibles, drawers, carousels, selection, and reordering
  through the shared primitives.
- Prefer transform and opacity. Avoid `transition: all` and layout-jank
  properties.
- Category collapses animate the whole category, not only its inner rows.
- Swipeable mobile content needs visual feedback such as a real adjacent-page
  preview and continuous sliding animation.
- Respect reduced motion and avoid automatically opening large drawers. A
  one-time contextual peek may signal readiness without stealing control.
- Keep hover-only destructive actions accessible by another method on touch.

## Responsive behavior

- Verify small mobile, tablet when composition changes, normal desktop, and
  wide desktop for responsive layout work.
- Give the active step width priority in compact steppers; completed and future
  steps may shrink without cropping the active label.
- Prevent sticky previews and action drawers from covering content or mobile
  safe areas.
- Prefer swipe gestures on mobile carousels, while retaining compact controls as
  discoverability and keyboard fallbacks.
- Recompose multi-column layouts on mobile; do not preserve empty desktop rails.
- Test long names, translated copy, large text, and no-date/no-location states.

## Visual verification

For meaningful UI changes:

1. Inspect the current rendered screen before editing.
2. Exercise relevant Scenario Mode worlds and overlays.
3. Capture or inspect representative mobile and desktop states.
4. Check focus, keyboard, touch targets, wrapping, overflow, and reduced motion.
5. Check browser console and network errors.
6. Compare against the latest user direction and nearby shared patterns.

Store generated screenshots and visual reports only in ignored `temp/` or
`reports/` paths.

## Product language

- Explain outcomes in plain language; keep implementation jargon out of product
  copy.
- Do not frame TeamForge like a dating app. `Match score` is acceptable where
  it describes group compatibility, but avoid swipe/like/heart language.
- Use sentence case and active, direct copy.
- Do not show placeholder statistics as live data.
- Preserve helpful onboarding and landing-page explanation; removing duplicate
  UI labels does not justify stripping essential instructional copy.

See `.agents/rules/teamforge/copy-guardrails.md` for product language and voice decisions.
