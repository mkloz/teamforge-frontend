# Forge Button - Complete User Flow

## Overview

The **Forge** button is TeamForge's primary call-to-action for creating new activity groups. This flow transforms the traditionally tedious "create event" process into an engaging, personality-aware experience that feels more like lighting a spark than filling out a form.

---

## Entry Points

### 1. Primary: Bottom Navigation "Forge" Button
- **Location**: Center of mobile bottom nav, prominent position in desktop sidebar
- **Visual**: Distinct from other nav items - larger, accent-colored, with subtle glow/pulse
- **Icon**: Flame or anvil icon representing "forging" a new connection

### 2. Secondary Entry Points
- Empty state in Groups tab: "No groups yet? Forge your first one"
- Profile page CTA: "Start an activity"
- After completing a group: "Forge another?"

---

## Complete User Flow

### Phase 1: Trigger & Entry Animation

```
┌─────────────────────────────────────────────────────────────┐
│  USER ACTION                                                │
│  Taps "Forge" button                                        │
├─────────────────────────────────────────────────────────────┤
│  SYSTEM RESPONSE                                            │
│  1. Haptic feedback (subtle vibration)                      │
│  2. Button scales down briefly (press feedback)             │
│  3. Full-screen modal slides up from bottom                 │
│  4. Background dims with backdrop blur                      │
│  5. Modal enters with spring animation                      │
└─────────────────────────────────────────────────────────────┘
```

**State**: `IDLE → OPENING`

---

### Phase 2: Activity Selection (Step 1 of 3)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                                    Step 1 of 3      │
│                                                             │
│                    🔥                                       │
│           What are you forging?                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔍  Search activities...                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Popular Categories                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ 🏃      │ │ 🎮      │ │ ☕      │ │ 🎨      │          │
│  │ Sports  │ │ Gaming  │ │ Social  │ │ Arts    │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ 🎵      │ │ 🌲      │ │ 📚      │ │ 🍕      │          │
│  │ Music   │ │Outdoors │ │Learning │ │ Food    │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Recent Activities                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎾 Tennis at Riverside     Used 3 times             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☕ Coffee & Code           Used 2 times             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Or describe something custom:                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "Weekend hiking trip to..."                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**User Actions Available**:
1. **Tap category** → Expands to show specific activities within category
2. **Search** → Filters activities in real-time
3. **Select recent activity** → Pre-fills form with past activity template
4. **Type custom** → Free-form activity description (AI-assisted naming)

**State Transitions**:
- `ACTIVITY_SELECTION` → Category tap → `ACTIVITY_DETAIL`
- `ACTIVITY_SELECTION` → Search → `SEARCHING` (debounced, 300ms)
- `ACTIVITY_SELECTION` → Custom text → Enable "Continue" button

**Loading State (Search)**:
```
┌─────────────────────────────────────────────────────────────┐
│  🔍  "board gam..."                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ░░░░░░░░░░░░░░░░░░░░  (skeleton)                   │   │
│  │  ░░░░░░░░░░░░░░░░░░░░                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 3: Activity Details (Step 2 of 3)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                                    Step 2 of 3      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │           [Cover Image Preview]                     │   │
│  │              Tap to change                          │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Activity Name                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Board Game Night                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Description (optional)                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Casual evening of strategy games. All skill       │   │
│  │  levels welcome! I'll bring Catan and Ticket...    │   │
│  └─────────────────────────────────────────────────────┘   │
│  AI Suggestion: "Add what games you have"                  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  When                                                       │
│  ┌───────────────────────┐ ┌───────────────────────┐       │
│  │ 📅 Sat, Mar 15        │ │ 🕖 7:00 PM            │       │
│  └───────────────────────┘ └───────────────────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Flexible time? Let the group decide                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Where                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📍 Search location or enter address...             │   │
│  └─────────────────────────────────────────────────────┘   │
│  Quick picks: My place | TBD | Virtual                     │
│                                                             │
│  Group Size                                                 │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                       │
│  │ 2  │ │ 3  │ │ 4* │ │ 5  │ │ 6+ │                       │
│  └────┘ └────┘ └────┘ └────┘ └────┘                       │
│  Recommended for Board Games: 3-5 people                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Continue                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Form Validation**:
| Field | Required | Validation | Error Message |
|-------|----------|------------|---------------|
| Name | Yes | 3-60 chars | "Give your activity a name" |
| Description | No | Max 500 chars | - |
| Date | Yes | Future date | "Pick a date in the future" |
| Time | Conditional | Required if not "flexible" | "Set a time or mark as flexible" |
| Location | Yes | Non-empty | "Where will you meet?" |
| Group size | Yes | 2-20 | Auto-selected, always valid |

**Error State Display**:
```
Activity Name
┌─────────────────────────────────────────────────────────────┐
│  Bo                                                   X     │
└─────────────────────────────────────────────────────────────┘
  Warning: Name must be at least 3 characters
```

**Continue Button States**:
- **Disabled**: Gray, `opacity-50`, fields incomplete
- **Enabled**: Primary color, full opacity
- **Pressed**: Scale down, darker shade

---

### Phase 4: Matching Preferences (Step 3 of 3)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                                    Step 3 of 3      │
│                                                             │
│           🎯                                                │
│    Who should join?                                         │
│    Set your matching preferences                            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Personality Compatibility                                  │
│  How important is personality match?                        │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Casual ────────*──────────────── Strict           │    │
│  └────────────────────────────────────────────────────┘    │
│  "Prefer compatible types, but stay open"                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Preferred Personality Types (optional)                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ ENFP * │ │ INFP   │ │ ENTP * │ │ INTP   │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ ENFJ   │ │ INFJ * │ │ ENTJ   │ │ INTJ   │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│  ... (remaining types)                                      │
│                                                             │
│  Based on your ENFP type, we recommend: INFJ, INTJ         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Trust Score Minimum                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Any ─────────*────────────────── Verified Only    │    │
│  └────────────────────────────────────────────────────┘    │
│  "Members with 70%+ trust score"                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Visibility                                                 │
│  ( ) Public - Anyone matching criteria can request         │
│  (*) Friends First - Prioritize mutual connections         │
│  ( ) Invite Only - Only people you invite                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              🔥 Forge This Group                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 5: Confirmation Dialog

Before final submission, show a confirmation:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Ready to Forge?                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Board Game Night                                   │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  Saturday, March 15 at 7:00 PM                      │   │
│  │  My Apartment, Downtown                             │   │
│  │  Looking for 3 more people                          │   │
│  │  Matching: Compatible personalities, 70%+ trust     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Once forged, compatible members will be notified and      │
│  can request to join your group.                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               🔥 Forge It!                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    ← Go Back & Edit                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 6: Loading / Processing State

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                         🔥                                  │
│                   (animated flame)                          │
│                                                             │
│               Forging your group...                         │
│                                                             │
│           ━━━━━━━━━━━░░░░░░░░░░░  45%                      │
│                                                             │
│             Creating group identity                         │
│             Finding compatible members                      │
│             Sending notifications                           │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Loading Stages** (shown sequentially):
1. "Creating your group..." (0-30%)
2. "Finding compatible members..." (30-70%)
3. "Almost there..." (70-100%)

**Duration**: 1.5-3 seconds (artificial delay for UX even if API is fast)

---

### Phase 7: Success State

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                     ** 🔥 **                                │
│                   (celebration)                             │
│                                                             │
│              Your group has been forged!                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │      Board Game Night                               │   │
│  │                                                     │   │
│  │      12 compatible members notified                 │   │
│  │      3 mutual friends can see this                  │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             View Your Group                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             Share Invite Link                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                   Forge Another                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Success Animations**:
1. Confetti burst from center
2. Checkmark morphs from flame icon
3. Stats count up (12 members notified)
4. Haptic success pattern

---

### Error Handling

#### Network Error
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         ⚠️                                  │
│                                                             │
│            Couldn't forge your group                        │
│                                                             │
│     Something went wrong with the connection.               │
│     Your progress has been saved.                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Try Again                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                   Save as Draft                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Validation Error (Server-side)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ⚠️ Please fix the following:                              │
│                                                             │
│  - Activity name contains prohibited words                  │
│  - Selected date conflicts with another group you created   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Go Back & Fix                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## State Machine

```
                              ┌─────────┐
                              │  IDLE   │
                              └────┬────┘
                                   │ tap Forge
                                   ▼
                         ┌─────────────────┐
                         │    OPENING      │
                         │  (animation)    │
                         └────────┬────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                      STEP 1: ACTIVITY                        │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐ │
│  │  SELECTING  │───▶│  SEARCHING   │───▶│  SEARCH_ERROR   │ │
│  └─────────────┘    └──────────────┘    └─────────────────┘ │
└─────────────────────────────┬────────────────────────────────┘
                              │ activity selected
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      STEP 2: DETAILS                         │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐ │
│  │   EDITING   │───▶│  VALIDATING  │───▶│ VALIDATION_ERROR│ │
│  └─────────────┘    └──────────────┘    └─────────────────┘ │
└─────────────────────────────┬────────────────────────────────┘
                              │ valid
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    STEP 3: PREFERENCES                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    CONFIGURING                          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬────────────────────────────────┘
                              │ forge button
                              ▼
                       ┌─────────────┐
                       │ CONFIRMING  │◀──────┐
                       └──────┬──────┘       │
                              │ confirm      │ go back
                              ▼              │
                       ┌─────────────┐       │
                       │  SUBMITTING │───────┘
                       └──────┬──────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │   SUCCESS   │ │NETWORK_ERROR│ │SERVER_ERROR │
       └─────────────┘ └─────────────┘ └─────────────┘
```

---

## Accessibility Considerations

1. **Focus Management**: Focus trap within modal, return focus to Forge button on close
2. **Screen Reader**: 
   - Modal announces "Create new group, step 1 of 3"
   - Progress communicated via aria-live regions
   - Error messages linked via aria-describedby
3. **Keyboard Navigation**:
   - Tab through all interactive elements
   - Escape closes modal (with confirmation if form has data)
   - Enter submits current step
4. **Reduced Motion**:
   - Skip animations for `prefers-reduced-motion`
   - Instant transitions instead of springs

---

## Data Model

```typescript
interface ForgeFormData {
  // Step 1
  activityCategory: PlanCategory | null;
  activityTemplate: string | null; // ID of recent/template activity
  customActivityName: string | null;
  
  // Step 2
  name: string;
  description: string;
  coverImage: string;
  date: string; // ISO date
  time: string | null; // null = flexible
  isTimeFlexible: boolean;
  location: string;
  locationCoords: { lat: number; lng: number } | null;
  maxMembers: number;
  
  // Step 3
  compatibilityStrictness: number; // 0-100
  preferredTypes: MBTIType[];
  minTrustScore: number; // 0-100
  visibility: 'public' | 'friends_first' | 'invite_only';
}

interface ForgeState {
  step: 1 | 2 | 3;
  formData: Partial<ForgeFormData>;
  isSubmitting: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
}
```

---

## Analytics Events

| Event | Trigger | Data |
|-------|---------|------|
| `forge_opened` | Modal opens | `{ entry_point }` |
| `forge_step_completed` | Step advance | `{ step, time_spent }` |
| `forge_category_selected` | Category tap | `{ category }` |
| `forge_template_used` | Recent activity selected | `{ template_id }` |
| `forge_submitted` | Forge button pressed | `{ form_data_summary }` |
| `forge_success` | Group created | `{ group_id, members_notified }` |
| `forge_error` | Error occurred | `{ error_type, step }` |
| `forge_abandoned` | Modal closed without submit | `{ step, time_spent }` |

---

## Visual Design Notes

### Color Usage
- **Primary action (Forge button)**: Accent color (amber) for maximum visibility
- **Step indicators**: Primary (teal) for completed, muted for upcoming
- **Error states**: Destructive red with appropriate contrast
- **Success state**: Primary teal with celebratory accents

### Animation Timing
- Modal entry: 300ms spring (stiffness: 400, damping: 30)
- Step transitions: 200ms ease-out
- Button press: 100ms scale down
- Success confetti: 1000ms burst, 3000ms fade

### Typography Hierarchy
- Modal title: `text-xl font-bold`
- Section headers: `text-sm font-semibold text-muted-foreground`
- Form labels: `text-sm font-medium`
- Helper text: `text-xs text-muted-foreground`
- Error text: `text-xs text-destructive`

---

## Implementation Checklist

- [ ] Create `ForgeModal` component with step navigation
- [ ] Implement `ActivitySelector` (Step 1) with search
- [ ] Implement `ActivityDetailsForm` (Step 2) with validation
- [ ] Implement `MatchingPreferences` (Step 3) with sliders
- [ ] Create `ConfirmationDialog` sub-component
- [ ] Add loading state with progress animation
- [ ] Add success state with confetti
- [ ] Implement error handling UI
- [ ] Add keyboard navigation and focus management
- [ ] Add haptic feedback (mobile)
- [ ] Connect to API endpoints
- [ ] Add analytics tracking
- [ ] Test accessibility with screen readers
