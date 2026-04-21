# TeamForge Homepage — Implementation Plan

**Document Version:** 1.0  
**Status:** Ready for Development  
**Target:** `/home` route (authenticated user dashboard)

---

## 1. Executive Summary

This plan translates the responsive wireframe layout into a production-ready homepage. The implementation follows TeamForge's established design system, prioritizes accessibility and maintainability, and ensures visual consistency across all breakpoints.

**Key deliverables:**
- Six section components replacing wireframe skeletons with real UI
- Full integration with existing design tokens and component library
- Responsive behavior from 320px mobile to 1536px+ wide desktop
- WCAG 2.1 AA accessibility compliance

---

## 2. HTML Structure Strategy

### 2.1 Semantic Landmark Hierarchy

The page uses HTML5 semantic elements to create a machine-readable document outline:

```
<div>              → Page container (max-width, padding)
  <div>            → 12-column grid scaffold
    <main>         → Primary content column (hero, plans, recommendations)
      <section>    → HomeHero (aria-labelledby)
      <hr>         → Visual divider (aria-hidden)
      <section>    → UpcomingPlans (aria-labelledby)
      <section>    → RecommendedGroups (aria-labelledby)
    </main>
    <aside>        → Sidebar column (groups grid, stats)
      <section>    → GroupsGrid (aria-labelledby)
      <section>    → PersonalStats (aria-labelledby)
    </aside>
  </div>
</div>
```

### 2.2 Heading Hierarchy

Each section receives a visually-styled heading that also serves as its accessible label:

| Section | Element | Level | aria-labelledby Target |
|---------|---------|-------|------------------------|
| HomeHero | `<h1>` | 1 | `home-hero-heading` |
| UpcomingPlans | `<h2>` | 2 | `upcoming-plans-heading` |
| GroupsGrid | `<h2>` | 2 | `groups-grid-heading` |
| PersonalStats | `<h2>` | 2 | `personal-stats-heading` |
| RecommendedGroups | `<h2>` | 2 | `recommended-groups-heading` |

The greeting inside HomeHero is the page's `<h1>` ("Good morning, [Name]"), establishing the page context. All other sections use `<h2>` as siblings within their respective landmark regions.

### 2.3 Interactive Element Semantics

| UI Element | HTML Element | Notes |
|------------|--------------|-------|
| "Forge My Group" CTA | `<button>` | Primary action, not navigation |
| Quick-action pills | `<a>` or `<button>` | `<a>` if navigating, `<button>` if triggering modal |
| Plan card | `<article>` | Self-contained content with heading |
| Plan "Details" button | `<a>` | Navigates to plan detail page |
| Group tile | `<a>` | Navigates to group detail/chat |
| "View All" tile | `<a>` | Navigates to groups list page |
| Recommendation card CTA | `<button>` | Triggers join request action |
| Trust score ring | `<div>` | Decorative visualization, values in `aria-label` |

---

## 3. CSS Layout Architecture

### 3.1 Layout Method Selection

Following the design system's Layout Priority order:

| Layout Need | Method | Justification |
|-------------|--------|---------------|
| Page-level 8/4 column split | CSS Grid | Two-dimensional placement at `lg:` breakpoint |
| Section vertical stacking | Flexbox | One-dimensional, sequential flow |
| Hero row (content + visual) | Flexbox | Row on `md:`, column on mobile |
| Plan card internal layout | Flexbox | Row alignment of icon, content, action |
| Groups tile grid | CSS Grid | 2D tile alignment with uniform sizing |
| Stats panel layout | Flexbox | Side-by-side on `md:`, stacked on mobile |
| Stats 2×2 item grid | CSS Grid | 2D placement required |
| Recommendation cards | CSS Grid | Auto-fill reflow; horizontal scroll fallback on mobile uses Flexbox |

### 3.2 Page-Level Grid Specification

```
Container: max-w-screen-2xl mx-auto px-4 lg:px-6 pt-2 md:pt-6 pb-8
Grid: grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10
Left column: col-span-1 lg:col-span-8
Right column: col-span-1 lg:col-span-4
```

This mirrors the Explore page's container conventions for cross-page consistency within the authenticated shell.

### 3.3 Responsive Breakpoint Behavior

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Default (mobile) | < 768px | Single column; all sections stacked; hero CTA full-width; recommendation cards in horizontal scroll carousel |
| `md:` (tablet) | ≥ 768px | Hero becomes row layout; plan cards show more detail inline; recommendation grid begins |
| `lg:` (desktop) | ≥ 1024px | 12-column grid activates (8/4 split); sidebar becomes sticky; groups grid shows 4+ columns |
| `xl:` (wide) | ≥ 1280px | Increased horizontal padding; more generous card sizing |

### 3.4 Sticky Sidebar Implementation

On `lg:` screens, the right column content (`GroupsGrid` + `PersonalStats`) becomes sticky:

```
Container: lg:relative
Inner wrapper: lg:sticky lg:top-8
```

The `top-8` offset accounts for the app header height plus comfortable breathing room. The sticky container encompasses both sections so they scroll together as a unit until hitting the bottom of the main column.

---

## 4. Component Implementation Details

### 4.1 HomeHero

**Structure:**
- Greeting header with personalized time-of-day message and user's first name
- Primary CTA card containing headline, supporting copy, and "Forge My Group" button
- Quick-action pills row (secondary navigation)
- Decorative forge orb visual (desktop only)

**Layout approach:**
- Outer: `flex flex-col md:flex-row md:items-center gap-6 md:gap-8`
- Left content: `flex flex-col gap-5 flex-1 min-w-0`
- Right visual: `hidden md:flex shrink-0 w-2/5 max-w-xs`

**Key styling decisions:**
- Greeting uses `text-2xl md:text-3xl font-bold text-foreground`
- CTA card uses `rounded-2xl border border-border bg-card p-5 md:p-6`
- Primary button uses existing `Button` component with `variant="default"` (Forge Teal)
- Quick-action pills use existing `Button` component with `variant="outline"` and `rounded-full`
- Forge orb visual: circular container with subtle border, can house animated SVG or static illustration

**Data requirements:**
- User's first name (from auth context)
- Current time for greeting variation ("Good morning/afternoon/evening")

### 4.2 UpcomingPlans

**Structure:**
- Section header with "Coming Up" title and "View All" link
- List of plan cards (maximum 3 visible)
- Empty state when no plans exist

**Layout approach:**
- Section: `flex flex-col gap-4`
- Header row: `flex items-center justify-between`
- Card list: `flex flex-col gap-3` (role="list")
- Each card: `flex flex-row items-center gap-4 rounded-2xl border bg-card p-4`

**Plan card internal structure:**
- Activity icon block (48px square, `rounded-xl`, activity-type-specific icon)
- Content area (`flex-1 min-w-0`): plan title, date/time, member avatars, status badge
- Action button: "Details" or "Chat" depending on plan state

**Status badge color mapping:**
- Confirmed: Forge Teal background
- Pending: Spark Amber background
- Planning: Slate/muted background

**Empty state design:**
- Centered illustration (calendar-related icon at 48px)
- Headline: "Your calendar is clear"
- Supporting text: "Forge a group to start planning activities"
- CTA button: "Forge My Group" (secondary variant)

**Data requirements:**
- User's upcoming plans array (fetched via API)
- Plan details: title, datetime, activity type, group name, member list, status

### 4.3 GroupsGrid

**Structure:**
- Section header with "Your Groups" title and count badge
- Grid of group tiles (6-8 visible plus "View All" tile)

**Layout approach:**
- Grid container: `grid gap-3` with inline style `gridTemplateColumns: repeat(auto-fill, minmax(120px, 1fr))`
- This auto-fill approach removes the need for breakpoint-specific column classes

**Group tile structure:**
- Container: `rounded-2xl border bg-card p-3 md:p-4` as `<a>` element
- Avatar: 48px square, `rounded-2xl`, with activity-type illustration or group image
- Unread indicator: absolute-positioned Amber dot (top-right of avatar)
- Group name: truncated single line, `text-sm font-medium`
- Member count: `text-xs text-muted-foreground`

**"View All" tile:**
- Dashed border variant (`border-dashed border-border bg-transparent`)
- Plus or arrow icon (24px)
- "All Groups" label

**Interaction states:**
- Hover: scale to 102%, border transitions to Forge Teal, shadow intensifies
- Focus: Teal focus ring
- Active groups with unread messages show Teal left border accent

**Data requirements:**
- User's joined groups array
- Per-group: id, name, avatar/activity type, member count, unread status, last activity timestamp

### 4.4 PersonalStats

**Structure:**
- Section header with "Your Progress" title
- Stats panel containing trust score ring and 4 stat items

**Layout approach:**
- Panel: `rounded-2xl border bg-card p-5 md:p-6`
- Internal: `flex flex-col md:flex-row items-center gap-6`
- Trust ring area: `flex flex-col items-center gap-2 shrink-0`
- Divider: `w-full h-px md:w-px md:h-24 bg-border/60`
- Stats grid: `grid grid-cols-2 gap-x-8 gap-y-5 flex-1`

**Trust score ring implementation:**
- SVG element with two `<circle>` elements:
  - Track circle: `stroke-muted`, 8px stroke width
  - Progress circle: `stroke-primary` (Forge Teal), animated `stroke-dashoffset`
- Center: trust score value in Spark Amber, "Trust" label below
- Animation: on mount, animate from 0 to current value over 1 second
- Reduced motion: skip animation, show final state immediately

**Stat items:**
- Large number: `text-2xl md:text-3xl font-bold text-foreground`
- Label: `text-xs font-medium text-muted-foreground`
- Four items: Groups Joined, Activities Done, Connections, Profile Completeness

**Profile completeness visualization:**
- Instead of just a number, show a small progress bar
- Track: `h-1.5 w-full rounded-full bg-muted`
- Fill: `bg-primary` width based on percentage

**Data requirements:**
- User's trust score (0-100)
- Groups joined count
- Activities completed count
- Connections made count
- Profile completeness percentage

### 4.5 RecommendedGroups

**Structure:**
- Section header with personalization cue and "Groups You Might Like" title
- Card grid/carousel of recommendation cards

**Layout approach:**
- Mobile: horizontal scroll carousel using Flexbox with `overflow-x-auto snap-x snap-mandatory`
- Desktop: CSS Grid with `gridTemplateColumns: repeat(auto-fill, minmax(220px, 1fr))`
- Cards have fixed minimum width on mobile (`w-[240px] flex-shrink-0`)

**Recommendation card structure:**
- Cover image area: `aspect-video` with `rounded-t-2xl overflow-hidden`
- Card body: `p-4 flex flex-col gap-3`
- Group name: `text-base font-semibold`
- Activity type: `text-sm text-muted-foreground`
- Compatibility meter: track + fill bar with percentage label
- Member avatar stack: 4 overlapping circular avatars
- CTA button: "Request to Join" (full width, primary variant)
- Personalization cue: small text explaining match reason

**Compatibility meter:**
- Track: `h-2 rounded-full bg-muted`
- Fill: `bg-primary` width based on compatibility percentage
- High compatibility (>80%): subtle Teal glow effect on card

**Empty state design:**
- Centered message: "Complete your profile to get personalized recommendations"
- CTA: "Edit Profile" button

**Data requirements:**
- Recommended groups array from algorithm
- Per-group: id, name, cover image, activity type, compatibility score, member previews, match reason

---

## 5. Accessibility Implementation

### 5.1 Keyboard Navigation

| Region | Tab Order | Keyboard Behavior |
|--------|-----------|-------------------|
| HomeHero | Greeting → CTA button → Quick-action pills (L-R) | Enter activates buttons |
| UpcomingPlans | "View All" link → Plan cards (top-bottom) → Card action buttons | Enter navigates |
| GroupsGrid | Group tiles (L-R, top-bottom) → "View All" tile | Enter navigates |
| PersonalStats | Non-interactive (stats only) | Skipped in tab order |
| RecommendedGroups | Cards (L-R) → CTA buttons within each card | Enter activates |

### 5.2 Screen Reader Announcements

| Element | Announcement Strategy |
|---------|----------------------|
| Greeting | Read as heading level 1 |
| Trust score | `aria-label="Trust score: 78 out of 100"` on ring container |
| Unread indicator | `aria-label="Unread messages"` on the dot element |
| Status badges | Color-independent text labels ("Confirmed", "Pending") |
| Compatibility | `aria-label="85% compatibility"` on meter container |
| Empty states | Read as paragraph content within section |

### 5.3 Focus Management

- All interactive elements have visible focus indicators (Teal ring, 2px offset)
- Focus traps are not needed on this page (no modals in initial implementation)
- Skip link targets `#main-content` (already present in AppLayout)

### 5.4 Reduced Motion

All animations respect `prefers-reduced-motion: reduce`:
- Trust score ring: skip stroke animation, display final state
- Card hover effects: use opacity-only transitions
- Section entrance animations: fade without translation

---

## 6. State Management Strategy

### 6.1 Data Fetching Pattern

Following the project's established patterns, use SWR for client-side data fetching:

| Data | SWR Key | Revalidation Strategy |
|------|---------|----------------------|
| User profile | `/api/users/me` | On focus, 60s interval |
| Upcoming plans | `/api/users/me/plans?upcoming=true&limit=3` | On focus |
| Joined groups | `/api/users/me/groups` | On focus |
| User stats | `/api/users/me/stats` | 5 minute interval |
| Recommendations | `/api/recommendations/groups?limit=3` | On focus |

### 6.2 Loading States

Each section implements its own skeleton loading state (already present in wireframe). The skeleton structure matches the expected content layout exactly to prevent layout shift.

### 6.3 Error States

Implement graceful degradation:
- Network errors: show inline retry button within the affected section
- Empty arrays: show empty state UI (not an error)
- Partial failures: sections load independently; one failing section does not block others

---

## 7. Styling Token Usage

### 7.1 Color Application

| Element | Token | CSS Variable |
|---------|-------|--------------|
| Page background | `bg-background` | `--background` (Canvas in light mode) |
| Card background | `bg-card` | `--card` (White in light mode) |
| Card border | `border-border` | `--border` |
| Primary text | `text-foreground` | `--foreground` (Ink) |
| Secondary text | `text-muted-foreground` | `--muted-foreground` (Slate) |
| Primary button | `bg-primary text-primary-foreground` | Forge Teal + White |
| Accent highlights | `text-accent` | Spark Amber (trust score value only) |
| Progress fills | `bg-primary` | Forge Teal |

### 7.2 Spacing Application

| Context | Token | Value |
|---------|-------|-------|
| Section gap (within main column) | `gap-10` | 40px |
| Card internal padding | `p-4 md:p-6` | 16px / 24px |
| Card list gap | `gap-3` | 12px |
| Grid gap | `gap-3` | 12px |
| Element inline gap | `gap-2` | 8px |

### 7.3 Border Radius Application

| Element | Token | Value |
|---------|-------|-------|
| Cards | `rounded-2xl` | 16px |
| Buttons | `rounded-xl` | 12px |
| Input fields | `rounded-xl` | 12px |
| Avatars | `rounded-full` | 50% |
| Badges/pills | `rounded-full` | 50% |
| Icon containers | `rounded-xl` | 12px |

### 7.4 Shadow Application

| State | Token | Usage |
|-------|-------|-------|
| Resting card | `shadow-sm` | Default card elevation |
| Hover card | Custom teal-tinted shadow | `shadow-[0_4px_12px_rgba(13,148,136,0.10)]` |
| Primary button | `shadow-button-primary` | Mechanical shadow for depth |

---

## 8. Animation Specifications

### 8.1 Entrance Animations

All sections use the existing `animate-fade-up` animation with staggered delays:

| Section | Delay |
|---------|-------|
| HomeHero | 0ms |
| UpcomingPlans | 100ms |
| GroupsGrid | 150ms |
| PersonalStats | 200ms |
| RecommendedGroups | 250ms |

Implementation: Apply `animate-fade-up` class with inline `animation-delay` style.

### 8.2 Interaction Animations

| Interaction | Properties | Duration | Easing |
|-------------|------------|----------|--------|
| Card hover scale | `transform: scale(1.02)` | 150ms | ease |
| Card hover border | `border-color: var(--primary)` | 200ms | ease |
| Card hover shadow | Shadow intensifies with Teal tint | 200ms | ease |
| Button hover | `transform: translateY(-2px)` | 150ms | ease |
| Button active | `transform: translateY(0)` | 50ms | ease |
| Link underline | Pseudo-element slide from left | 200ms | ease |

### 8.3 Trust Score Ring Animation

- SVG circle uses `stroke-dasharray` set to circumference
- On mount, `stroke-dashoffset` animates from circumference to calculated offset
- Duration: 1000ms, easing: `ease-out`
- Respects `prefers-reduced-motion`

---

## 9. Component Dependency Map

### 9.1 Existing Components to Reuse

| Component | Location | Usage |
|-----------|----------|-------|
| Button | `@/components/ui/button` | All CTA and action buttons |
| Avatar | `@/components/ui/avatar` | Member avatar stacks |
| Badge | `@/components/ui/badge` | Status indicators, count badges |
| Card | `@/components/ui/card` | May use for consistent card styling |
| Skeleton | `@/components/ui/skeleton` | Loading state placeholders |

### 9.2 New Components to Create

| Component | Purpose | Location |
|-----------|---------|----------|
| HomeHero | Hero section with CTA | `features/home/components/home-hero.tsx` |
| UpcomingPlans | Plans list section | `features/home/components/upcoming-plans.tsx` |
| PlanCard | Individual plan card | `features/home/components/plan-card.tsx` |
| GroupsGrid | Groups quick-access grid | `features/home/components/groups-grid.tsx` |
| GroupTile | Individual group tile | `features/home/components/group-tile.tsx` |
| PersonalStats | Stats and trust score panel | `features/home/components/personal-stats.tsx` |
| TrustScoreRing | Animated SVG ring | `features/home/components/trust-score-ring.tsx` |
| StatItem | Single stat display | `features/home/components/stat-item.tsx` |
| RecommendedGroups | Recommendations section | `features/home/components/recommended-groups.tsx` |
| GroupRecommendationCard | Individual recommendation | `features/home/components/group-recommendation-card.tsx` |
| CompatibilityMeter | Visual compatibility bar | `features/home/components/compatibility-meter.tsx` |
| EmptyState | Generic empty state | `@/components/empty-state.tsx` (shared) |

### 9.3 Shared Utilities

| Utility | Purpose | Location |
|---------|---------|----------|
| `getGreeting(hour)` | Returns time-of-day greeting | `features/home/utils/get-greeting.ts` |
| `formatRelativeTime(date)` | "2 hours ago", "Tomorrow" | `@/lib/date-utils.ts` (existing or create) |
| `cn()` | Class name merger | `@/lib/utils.ts` (existing) |

---

## 10. Testing Considerations

### 10.1 Unit Tests

| Component | Test Cases |
|-----------|------------|
| HomeHero | Renders greeting with user name; renders correct time-of-day greeting; CTA button is accessible |
| UpcomingPlans | Renders plan list; renders empty state when no plans; plan cards are keyboard accessible |
| GroupsGrid | Renders correct number of tiles; unread indicator appears correctly; "View All" tile present |
| PersonalStats | Trust ring displays correct percentage; stats render with correct values |
| TrustScoreRing | Animates correctly; respects reduced motion; displays correct aria-label |
| RecommendedGroups | Renders cards; compatibility meter shows correct fill; empty state appears when no recommendations |

### 10.2 Accessibility Tests

- Run axe-core on page load
- Verify heading hierarchy with browser dev tools
- Test keyboard navigation flow
- Verify screen reader announcements with VoiceOver/NVDA
- Test with forced-colors mode (Windows High Contrast)

### 10.3 Responsive Tests

- Test at 320px, 375px, 768px, 1024px, 1280px, 1536px widths
- Verify horizontal scroll carousel works on touch devices
- Verify sticky sidebar behavior on desktop
- Verify no horizontal overflow at any breakpoint

---

## 11. Implementation Sequence

### Phase 1: Foundation
1. Create shared utilities (`getGreeting`, `EmptyState` component)
2. Create `TrustScoreRing` component (most complex animation)
3. Create `CompatibilityMeter` component (reusable)

### Phase 2: Atomic Components
4. Create `PlanCard` component
5. Create `GroupTile` component
6. Create `GroupRecommendationCard` component
7. Create `StatItem` component

### Phase 3: Section Components
8. Implement `HomeHero` (replace wireframe skeleton)
9. Implement `UpcomingPlans` (replace wireframe skeleton)
10. Implement `GroupsGrid` (replace wireframe skeleton)
11. Implement `PersonalStats` (replace wireframe skeleton)
12. Implement `RecommendedGroups` (replace wireframe skeleton)

### Phase 4: Integration
13. Wire up SWR data fetching hooks
14. Connect sections to real API data
15. Implement loading and error states
16. Add entrance animations with stagger

### Phase 5: Polish
17. Accessibility audit and fixes
18. Cross-browser testing
19. Performance optimization (lazy loading recommendations if below fold)
20. Final visual QA against design system

---

## 12. Performance Considerations

### 12.1 Initial Load Optimization

- Skeleton states prevent Cumulative Layout Shift (CLS)
- Hero section renders immediately (no data dependency for greeting)
- Below-fold sections (RecommendedGroups) can use intersection observer for lazy data fetching

### 12.2 Runtime Performance

- Trust score ring uses CSS animation (GPU-accelerated)
- Card hover effects use `transform` and `opacity` only (no layout thrashing)
- Avatar stacks use fixed dimensions to avoid image resize calculations

### 12.3 Bundle Size

- Reuse existing UI components to minimize bundle growth
- SVG icons from Lucide are tree-shaken
- No additional animation libraries needed (CSS-only)

---

## 13. Maintenance Guidelines

### 13.1 Adding New Stats

To add a new stat to PersonalStats:
1. Add the stat key to the API response type
2. Add a new `StatItem` instance in the stats grid
3. Update the `aria-label` on the stats container if needed

### 13.2 Modifying Card Layouts

All cards follow the same structural pattern:
- Container: `rounded-2xl border bg-card p-4`
- Internal: Flexbox with consistent gap values
- Actions: Right-aligned or full-width at bottom

### 13.3 Theme Customization

All colors reference design tokens. To adjust:
1. Modify CSS variables in `theme.css`
2. Components automatically inherit changes
3. No component code changes needed for color adjustments

---

_This implementation plan serves as the authoritative reference for building the TeamForge homepage. All development should follow these specifications to ensure consistency with the established design system and wireframe structure._
