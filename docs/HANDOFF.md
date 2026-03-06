# TeamForge Frontend — Handoff Document
Generated: 2026-03-06. Covers everything built and decided in the previous chat session.

---

## Project Identity

- **Repo**: `teamforge-frontend`, branch `v0/mkloz-7ff9e593` (base `main`)
- **Stack**: React 19, Vite 7, TypeScript, TailwindCSS v4, TanStack Router, Framer Motion, Lucide
- **Package manager**: `pnpm`
- **Path alias**: `@` → `src/`
- **Vite cache dir**: `node_modules/.vite-cache` (changed from default `.vite/deps` to avoid ENOTEMPTY sandbox error)
- **Preview URL**: served from the Vite dev server on the Vercel sandbox

---

## Design System

### Color Tokens (globals.css)
```
--color-canvas:       #FAFAF8   (page background)
--color-ink:          #1C1C1A   (primary text)
--color-slate-muted:  #6B7280   (secondary text)
--color-forge-teal:   #0D9488   (primary brand / CTA)
--color-spark-amber:  #F59E0B   (accent / recommended badges)
--color-hero-bg:      dark bg used on the right animation panel
```

### Layout Pattern
Every full-page screen uses a two-column shell on lg+:
- **Left**: scrollable form area, `bg-canvas`, `max-w-lg` centered content
- **Right**: `bg-hero-bg`, renders `<VoronoiCatalyst progress={n} isTyping={bool} />`
- On mobile: single column, white card with `rounded-[2rem]` and `ring-1 ring-slate-900/5`
- Top accent line: 1px teal gradient `from-forge-teal to-amber-400` (mobile) or solid teal (desktop)

### Fonts
Two families only: one heading, one body — configured in `globals.css` via `@theme inline`.

### Motion
Shared constants in `src/features/onboarding/constants/motion.ts`:
- `staggerContainer` — parent variant with staggerChildren
- `fadeUpItem` — child variant (opacity 0→1, y 20→0)
- All page transitions: `AnimatePresence mode="wait"` with `opacity/y` in/out

### Shared Components
- `<BackgroundTexture />` — subtle noise texture overlay
- `<VoronoiCatalyst progress isTyping />` — the right-panel animated SVG
- `<TeamForgeLogo />` — from `src/assets/logo.tsx`
- All shadcn/ui components live in `src/shared/components/ui/`

---

## Routes

| Path | Component | File |
|---|---|---|
| `/` | `LandingPage` | `src/features/landing/landing-page.tsx` |
| `/auth/login` | `AuthPage defaultView="login"` | `src/features/auth/auth-page.tsx` |
| `/auth/register` | `AuthPage defaultView="register"` | `src/features/auth/auth-page.tsx` |
| `/onboarding/personality` | `PersonalityTestPage` | `src/features/onboarding/personality-test-page.tsx` |
| `/onboarding/interests` | `InterestsPage` | `src/features/onboarding/interests-page.tsx` |

Router: TanStack Router, file `src/router.tsx`. Add new routes by creating a `createRoute({...})` and appending to `routeTree.addChildren([...])`.

**Onboarding flow**: Auth success → `/onboarding/personality` → `/onboarding/interests` → (next step TBD, likely `/onboarding/location` or home).

---

## Auth Feature (`src/features/auth/`)

### Files
```
auth-page.tsx                    — two-column shell, toggles login/register
components/
  login-form.tsx                 — email + password, onSuccess navigates to /onboarding/personality
  register-form.tsx              — 3-step wizard (Credentials → OTP → Profile)
  voronoi-catalyst.tsx           — right-panel animation, receives progress [0-1] + isTyping bool
  register-steps/
    step-credentials.tsx         — name, email, password
    step-otp.tsx                 — 6-digit OTP field
    step-profile.tsx             — age, city, gender (dropdown added in this session)
schemas/
  auth-schemas.ts                — Zod schemas: registerSchema, loginSchema
```

### Register Form Steps
- Step 1: name, email, password (with strength meter)
- Step 2: OTP (6-digit, email verification)
- Step 3: age (number), city (text), gender (select: Male / Female / Non-binary / Prefer not to say)

### Gender field
Added in this session. Uses a native `<select>` inside a styled wrapper. Schema field: `gender: z.string()`. It is in `StepProfile` and the `registerSchema`.

---

## Personality Test Feature (`src/features/onboarding/`)

### Psychological Model
- **Backend model**: Big Five OCEAN (not raw MBTI)
- **Display model**: 4-letter MBTI type + A/T variant, derived from OCEAN via McCrae/Costa correlations
- **Vector**: 5D `{ O, C, E, A, N }`, each `[-1, 1]` continuous
- **Translation**:
  - E/I ← Energy (E > 0 → E, else I)
  - S/N ← Openness (O > 0 → N, else S)
  - T/F ← Warmth/Agreeableness (A > 0 → F, else T)
  - J/P ← Conscientiousness (C > 0 → J, else P)
  - A/T variant ← Neuroticism (N ≤ 0 → Assertive, N > 0 → Turbulent)
- **Soft boundary**: dimensions within ±0.167 of zero are flagged `softBoundary: Dimension[]` — letter still assigned, but backend stores the raw float

### Question Bank (`data/ipip-questions.ts`)
- 150 IPIP-derived items total (30 per dimension: O, C, E, A, N)
- Each item: `{ id: number, text: string, dimension: Dimension, keyed: "+" | "-" }`
- Reversed items (`keyed: "-"`) are scored as `6 - rawAnswer` before summing
- Re-worded from IPIP public domain constructs in plain English — no clinical terminology

### Test Length Options (`data/ipip-questions.ts` → `TEST_LENGTH_CONFIG`)
| Key | Label | Items | Pages | Duration |
|---|---|---|---|---|
| 30 | Quick | 30 | 10 | ~2 min |
| 50 | Standard (recommended) | 50 | 17 | ~5 min |
| 150 | Deep | 150 | 50 | ~15 min |

Questions per page: **always 3** regardless of length. Interleave pattern: O → C → E → A → N cycling.

### Screen Flow (orchestrated by `usePersonalityTest` hook)
```
intro → theory → guidelines → length → questions → [intermission@33%,66%] → calculating → results
```
- `screen.id` is a discriminated union driving `<ScreenRenderer />`
- `intermission` screen fires at 33% and 66% answered
- `calculating` screen: 1.8s hold, real OCEAN vector bars animate (computed eagerly before this screen)
- `results` screen: type reveal tiles + OCEAN spectrum bars + Retake button

### Scoring (`utils/score-calculator.ts`)
```ts
normalize(sum, n) = (sum - n*3) / (n*2)  // → [-1, 1]
```
`toDisplayPercent(vector, dim)` converts to 0-100% for bar display; N dimension is inverted to show "Emotional Stability".

### Results (`components/personality-results.tsx`)
- Four letter tiles with axis label beneath (Energy / Mind / Nature / Tactics) and teal underline accent
- One-line archetype + variant label
- Description card: two paragraphs (how they think, how they show up in groups)
- 5 OCEAN spectrum bars (labeled in plain English, not OCEAN letters)
- Compatibility note explaining similarity-based matching
- Two CTAs: "Continue to interests" (primary) + "Retake test" (ghost, returns to length selector)

### Type Descriptions (`data/type-descriptions.ts`)
Static map keyed by 4-letter type string. Each entry: `{ name, archetype, tagline, groupBehavior }`. 16 entries covering all types.

### Key Files
```
personality-test-page.tsx          — page shell + two-column layout + VoronoiCatalyst
hooks/use-personality-test.ts      — all state logic (screens, answers, scoring, navigation)
components/
  personality-intro.tsx            — Caloz-style intro with benefit rows + privacy note
  theory-101.tsx                   — brief Big Five science explainer
  keep-in-mind.tsx                 — guidelines before questions (honesty, instinct)
  length-selector.tsx              — 3 card options, amber "Recommended" pill on Standard
  question-page.tsx                — renders 3 question-cards + micro-progress dots + time estimate
  question-card.tsx                — "Q X of Y" pill + statement + likert scale
  likert-scale.tsx                 — 5 dots with full labels: Strongly disagree → Strongly agree
  milestone-banner.tsx             — slide-down banner at 33% / 66% (non-blocking, 2s auto-dismiss)
  intermission-page.tsx            — full intermission screen at milestones
  calculating-screen.tsx           — dark screen, real OCEAN bars animate from actual vector
  personality-results.tsx          — results screen (see above)
utils/
  score-calculator.ts              — calculateVector(), toDisplayPercent()
  type-translation.ts              — vectorToType() → { type, variant, info }
data/
  ipip-questions.ts                — 150 items + TEST_LENGTH_CONFIG + buildQuestionList()
  type-descriptions.ts             — 16 type entries
constants/
  motion.ts                        — staggerContainer, fadeUpItem
```

---

## Interests Feature (`src/features/onboarding/`)

### Data Model (aligned with dissertation schema)
The interests system is a **3-level hierarchy**:
```
L1: Category  (7 categories)
  L2: Subcategory  (8-10 per category, carries emoji)
    L3: LeafTag  (7-13 per subcategory, selection target)
```

Only **L3 leaf tags** are stored as `UserInterest` records (one row per selected tag). The matching algorithm uses a **binary cosine-similarity vector** where each dimension = presence/absence of a leaf tag.

### Data Shape (`data/interests-data.ts`)
```ts
interface LeafTag { id: string; label: string; }
interface Subcategory { id: string; label: string; emoji: string; tags: LeafTag[]; }
interface Category {
  id: string; label: string; description: string; color: string;
  subcategories: Subcategory[];
}
```

### Categories (L1)
1. **Sport & Movement** — color: `bg-emerald-400`
2. **Arts & Creativity** — color: `bg-violet-400`
3. **Mind & Learning** — color: `bg-blue-400`
4. **Social & Lifestyle** — color: `bg-amber-400`
5. **Technology & Digital** — color: `bg-cyan-400`
6. **Nature & Outdoors** — color: `bg-green-500`
7. **Entertainment & Media** — color: `bg-rose-400`

### Scale
- 7 L1 categories
- ~70 L2 subcategories total (~10 per category)
- ~650+ L3 leaf tags total (~9 per subcategory)
- Tag IDs are snake_case strings (e.g. `"rock_climbing"`, `"ai_ml"`, `"natural_wine"`)

### Key Exports (`data/interests-data.ts`)
```ts
INTEREST_CATEGORIES: Category[]          // full 3-level tree
ALL_LEAF_TAGS: LeafTag[]                 // flat array of all L3 tags
LEAF_TAG_BY_ID: Record<string, LeafTag> // fast lookup
LEAF_TO_SUBCATEGORY: Record<string, string> // leafId → subcategory label
MIN_INTERESTS = 5                        // minimum to continue
MAX_INTERESTS = 40                       // maximum selectable
MBTI_SUGGESTIONS: Record<string, string[]> // 16 type → 8 seed tag IDs each
```

### UI (`interests-page.tsx`)
- Two-column shell (same as personality test)
- **Suggested for you** section at top: reads MBTI type from `sessionStorage.getItem("personality_type")`, maps via `MBTI_SUGGESTIONS`
- **Search bar**: full-text filter across all leaf tag labels
- **Category filter tabs**: horizontal pill row, "All" + one per L1 category, shows per-category selected count badge
- **`<InterestCategorySection />`**: 3-level drill-down — L1 header collapses/expands, L2 subcategory tabs switch the visible tag set, L3 chips are the selection targets
- **`<InterestChip />`**: `{ id, label, selected, disabled, onToggle }` — checkmark appears on selected, disabled state when at MAX and not selected
- **`<MaxNudge />`**: fixed top toast when user tries to exceed MAX_INTERESTS
- **Selection tray**: slides in above footer, shows all selected chips as removable pills using `LEAF_TAG_BY_ID` lookup
- **Privacy note**: Lock icon + "Only used for matching. Never shared." beneath subtitle
- **Progress track**: `selected.size / MIN_INTERESTS` fill, unlocks CTA at MIN_INTERESTS
- **Footer CTA**: "Continue" disabled + grey until MIN_INTERESTS met, then teal

### Key Components
```
components/
  interest-category-section.tsx   — 3-level drill-down (L1 collapse, L2 tabs, L3 chips)
  interest-chip.tsx               — leaf tag toggle pill
interests-page.tsx                — page orchestrator
data/
  interests-data.ts               — full taxonomy + helpers + constants
```

---

## Decisions & Rationale Log

### Why Big Five instead of raw MBTI
MBTI has 50% test-retest reclassification rate and trademark/IP risk. Big Five (IPIP public domain) produces a continuous 5D vector that feeds the matching algorithm's cosine similarity. The 4-letter MBTI label is derived from the vector post-scoring and shown to users for familiarity — it is never directly measured.

### Why fixed 3 questions per page (not adaptive)
Adaptive termination (binary search) would produce coarse vector values for users near dimension midpoints — exactly where granularity matters most for matching. Fixed 3 per page gives consistent data quality across all users regardless of response pattern.

### Why interleaved questions (not grouped by dimension)
Grouping by dimension enables gaming (user recognises the axis and anchors) and reduces response variance. Interleaving O→C→E→A→N cycling prevents pattern recognition and maintains engagement.

### Why L3 only (not L1/L2) stored as UserInterest
The dissertation's cosine similarity operates on a binary vector where each dimension is a specific interest, not a category. Storing L1/L2 would collapse too many distinct interests into one dimension, reducing matching precision. L3 maximises vector dimensionality for fine-grained similarity.

### Why similarity (not complementarity) for matching
Research on early-stage trust formation and homogeneous group cohesion supports similarity matching for the initial match. Complementarity may be introduced as an optional filter in later phases.

### Why no back button during questions
Allowing back navigation introduces overthinking and re-anchoring (users change answers to match a type they want, not what they actually do). The 5-point scale's neutral center is the uncertainty escape valve.

### Vite cache dir change
Changed to `node_modules/.vite-cache` to avoid `ENOTEMPTY: directory not empty` sandbox errors on the default `.vite/deps` path caused by concurrent read/write during hot reload.

---

## What Does Not Exist Yet (Next Steps)

1. **Backend API integration** — all data is currently frontend-only (no API calls). The personality vector and interests selection are not persisted anywhere. Next: `PATCH /profile/personality` and `POST /profile/interests` with the computed vector and selected tag IDs.

2. **GDPR consent gate** — planned (see previous session plan) but not built. Needs a modal before the personality test begins, persisting consent timestamp to `POST /profile/personality/consent`.

3. **`/onboarding/location` route** — the third onboarding step (city/location preferences). Not built. The interests page CTA currently navigates to `window.location.href = "/"` as a placeholder.

4. **Auth is mocked** — login and register forms do not call any real API. The OTP step is purely UI. Real auth integration requires backend endpoints.

5. **`usePersonalityTest` hook** — `src/features/onboarding/hooks/use-personality-test.ts` is imported by `personality-test-page.tsx` but was not read in this session. It contains all the screen-transition and answer-management state logic. Read this before modifying test flow.

6. **`sessionStorage.setItem("personality_type", result.type)`** — this must be set in `personality-results.tsx` at the moment of result display so the interests page can read it for MBTI suggestions. Verify this is actually written; if not, add it in `usePersonalityTest`'s `handleCalculationDone` or in `PersonalityResults` on mount.

7. **Interest vector serialisation** — `buildInterestVector()` exists in `data/interests-data.ts` (or should — verify its presence). It must convert `Set<string>` of selected tag IDs into a sparse binary vector for the matching API.

8. **Mobile UX review** — the 3-level drill-down in `InterestCategorySection` has not been tested on narrow viewports. The L2 subcategory tab row uses `flex-wrap gap-2` which may overflow awkwardly at <375px.

---

## File Map (Onboarding Feature Only)

```
src/features/onboarding/
├── personality-test-page.tsx
├── interests-page.tsx
├── hooks/
│   └── use-personality-test.ts
├── components/
│   ├── personality-intro.tsx
│   ├── theory-101.tsx
│   ├── keep-in-mind.tsx
│   ├── length-selector.tsx
│   ├── question-page.tsx
│   ├── question-card.tsx
│   ├── likert-scale.tsx
│   ├── milestone-banner.tsx
│   ├── intermission-page.tsx
│   ├── calculating-screen.tsx
│   ├── personality-results.tsx
│   ├── interest-category-section.tsx
│   └── interest-chip.tsx
├── data/
│   ├── ipip-questions.ts
│   ├── type-descriptions.ts
│   └── interests-data.ts
├── utils/
│   ├── score-calculator.ts
│   └── type-translation.ts
└── constants/
    └── motion.ts
```
