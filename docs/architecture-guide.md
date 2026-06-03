# TeamForge - Architecture Guide

**Version 2.0 | Technical Architecture Documentation**

---

## Overview

TeamForge follows a decoupled architecture with a React-based frontend (this repository) and a separate backend API. This document covers the frontend architecture and the expected backend contract.

---

## 1. System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     React SPA (Vite + TypeScript)                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │  TanStack   │  │   Zustand   │  │    React    │               │  │
│  │  │   Router    │  │   Stores    │  │  Hook Form  │               │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │  │
│  │  ┌───────────────────────────────────────────────────────────┐   │  │
│  │  │               TanStack Query (Server State)                │   │  │
│  │  └───────────────────────────────────────────────────────────┘   │  │
│  │  ┌───────────────────────────────────────────────────────────┐   │  │
│  │  │                  ky HTTP Client (JWT Auth)                 │   │  │
│  │  └───────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / REST
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Backend API (REST)                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │    Auth     │  │   Matching  │  │   Groups    │               │  │
│  │  │   Service   │  │  Algorithm  │  │   Service   │               │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │    Chat     │  │    Trust    │  │ Notification│               │  │
│  │  │   Service   │  │   Service   │  │   Service   │               │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                  │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐   │
│  │    PostgreSQL     │  │      Redis        │  │   File Storage    │   │
│  │  (Primary Data)   │  │  (Cache/Sessions) │  │   (Attachments)   │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | React | 19.2 | UI rendering |
| Language | TypeScript | 5.9 | Type safety |
| Build | Vite | 7.x | Development and bundling |
| Routing | TanStack Router | 1.x | Manual route tree in `src/router.tsx` |
| URL State | nuqs | 2.x | URL-backed UI state |
| Server State | TanStack Query | 5.x | API data fetching and caching |
| Client State | Zustand | 5.x | UI state management |
| Forms | React Hook Form + Zod | 7.x / 4.x | Form handling and validation |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Components | shadcn/ui + Radix | - | Accessible UI primitives |
| HTTP | ky | 1.x | HTTP client with interceptors |
| Realtime | Socket.IO client | 4.x | Live chat, plan, group, and notification events |
| Animation | Framer Motion | 12.x | Motion and transitions |

### Directory Structure

```
src/
├── assets/                  # Static assets (SVGs, images)
├── config/                  # Environment configuration
│   └── config.ts           # Runtime env vars
├── features/               # Feature modules (domain-driven)
│   ├── activity/           # Conversation feed, direct chats, group detail panels
│   ├── app-shell/          # Layout (sidebar and bottom nav)
│   ├── auth/               # Authentication flows
│   ├── design-system/      # Internal component showcase / visual QA route
│   ├── download/           # PWA install guidance and diagnostics
│   ├── explore/            # Group/user discovery
│   ├── forge/              # Core "Forge my group" wizard
│   ├── group-plan-detail/  # Dedicated group and plan briefing route
│   ├── home/               # Dashboard
│   ├── landing/            # Public marketing page
│   ├── legal/              # Privacy and terms pages
│   ├── notifications/      # Notification system
│   ├── onboarding/         # Personality test + interests
│   ├── profile/            # User profile
│   ├── settings/           # Account settings
│   └── user-menu/          # User dropdown menu
├── shared/                 # Cross-cutting concerns
│   ├── api/                # Configured HTTP client, session, query client
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Shared hooks
│   ├── lib/                # Shared utilities and mappers
│   ├── providers/          # App-wide providers
│   ├── schemas/            # Canonical backend-aligned domain schemas
│   └── store/              # Shared UI stores
├── index.css               # Tailwind directives + CSS vars
├── main.tsx                # App entry point
└── router.tsx              # Route definitions
```

### Feature Module Pattern

Every feature follows a consistent internal structure:

```
src/features/<feature-name>/
├── <feature-name>-page.tsx   # Route-level page component
├── components/               # Feature-specific components
│   └── <sub-feature>/
│       └── component.tsx
├── api/                      # Feature-local services, adapters, query factories
├── hooks/                    # Custom hooks (data fetching, UI logic)
├── store/                    # Zustand stores (local UI state)
├── types/                    # TypeScript interfaces
├── schemas/                  # Zod validation schemas
├── constants/                # Static configuration
├── data/                     # Mock data (temporary)
└── lib/                      # Pure utility functions
```

**Rules:**
- All feature code is co-located within its feature directory
- No cross-feature imports of internal modules
- Shared code goes in `src/shared/`
- Page components are thin - business logic lives in hooks
- Backend-facing data seams should live in feature-local `api/` modules

### Current Frontend Notes

- Routes are still declared manually in `src/router.tsx`; the repo is not using TanStack file-based routing.
- The authenticated app shell is protected through the `app-shell` route `beforeLoad`.
- Conversation feed UI lives inside `src/features/activity/`; the full group and plan briefing route lives in `src/features/group-plan-detail/`.
- Canonical backend-aligned domain models live in `src/shared/schemas/`, while features layer UI-specific projections on top.
- Social safety UI is split between Activity direct-chat panels and Settings Safety. Activity uses `/friends` plus `/friends/blocked`; Settings uses `/friends/blocked` for blocked-user management.
- Global realtime is initialized in `src/app/runtime/app-realtime-sync.tsx` and handles app-wide `notification.new` and `group.updated` events in `src/app/runtime/app-realtime-events.ts`. Activity and group-plan detail routes handle subscribed chat, read, typing, presence, plan, and group events locally.
- The app is configured as a PWA through `vite-plugin-pwa`; the `/download` route provides install guidance, diagnostics, and push-notification readiness checks.

---

## 3. State Management Strategy

### State Categories

| Category | Tool | Location | Example |
|----------|------|----------|---------|
| Server data | TanStack Query | Feature hooks | User profile, groups, messages |
| UI state (shared) | Zustand | Feature stores | Forge wizard step, selected filters |
| Form state | React Hook Form | Component | Registration form, plan editor |
| Local ephemeral | useState/useReducer | Component | Dropdown open state |

### TanStack Query Patterns

```typescript
// Query key convention: [entity, identifier, ...params]
const queryKey = ['groups', groupId, 'messages'];

// Mutation with optimistic updates
const mutation = useMutation({
  mutationFn: sendMessage,
  onMutate: async (newMessage) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (old) => [...old, newMessage]);
    return { previous };
  },
  onError: (err, newMessage, context) => {
    queryClient.setQueryData(queryKey, context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey });
  },
});
```

### Social Cache Contract

Social mutations update more than one route surface. Keep these query-key groups in sync when changing related behavior:

| Flow | Caches to refresh |
|------|-------------------|
| Accept group invite or join open group | Home groups, home plans, home stats, explore groups, Activity groups, Activity chats, group selection |
| Send group invite | Home sent invitations, home received invitations, notifications, unread count |
| Group leave, removal, disband, or `group.updated` realtime | Activity groups, Activity chats, group selection, home groups, home plans, home stats |
| Accept friend request or receive `FRIEND_ACCEPTED` notification | Explore friend requests, Activity friendships, Activity chats, direct selection |
| Block or unblock user | Settings blocked users, Activity friendships, Activity chats, direct selection |
| Submit group rating | Activity ratings for that group |

### Zustand Store Pattern

```typescript
// Feature store with TypeScript
interface ForgeStore {
  step: number;
  activity: Activity | null;
  setStep: (step: number) => void;
  setActivity: (activity: Activity) => void;
  reset: () => void;
}

export const useForgeStore = create<ForgeStore>((set) => ({
  step: 0,
  activity: null,
  setStep: (step) => set({ step }),
  setActivity: (activity) => set({ activity }),
  reset: () => set({ step: 0, activity: null }),
}));
```

---

## 4. Routing Architecture

### Route Structure

| Route | Component | Auth Required | Layout |
|-------|-----------|---------------|--------|
| `/` | LandingPage | No | Full-page |
| `/download` | DownloadPage | No | Full-page |
| `/privacy` | LegalPage | No | Full-page |
| `/terms` | LegalPage | No | Full-page |
| `/auth` | Redirect to login | No | Full-page |
| `/auth/login` | LoginPage | No | Full-page |
| `/auth/register` | RegisterPage | No | Full-page |
| `/auth/forgot-password` | ForgotPasswordPage | No | Full-page |
| `/auth/reset-password/$token` | ResetPasswordPage | No | Full-page |
| `/auth/activate/$token` | ActivateAccountPage | No | Full-page |
| `/onboarding/profile` | ProfileBasicsPage | Yes | Full-page |
| `/onboarding/personality` | PersonalityTestPage | Yes | Full-page |
| `/onboarding/interests` | InterestsPage | Yes | Full-page |
| `/home` | HomePage | Yes | App Shell |
| `/explore` | ExplorePage | Yes | App Shell |
| `/groups/$groupId` | GroupPlanDetailPage | Yes | App Shell |
| `/activity` | ActivityPage | Yes | App Shell |
| `/profile` | ProfilePage | Yes | App Shell |
| `/users/$userId` | UserDetailPage | Yes | App Shell |
| `/settings` | SettingsPage | Yes | App Shell |
| `/forge` | ForgePage | Yes | App Shell |
| `/design-system/icon-notice-variants` | IconNoticeVariantsPage | No | Dev-only full-page |

### App Shell Layout

The authenticated app uses a consistent shell:

```
┌────────────────────────────────────────────────────────────┐
│                         Top Bar                            │
│  [Logo]              [Search]           [Notifications] [Avatar]
├────────────┬───────────────────────────────────────────────┤
│            │                                               │
│   Sidebar  │                Main Content                   │
│   (Desktop)│                                               │
│            │                                               │
│  - Home    │                                               │
│  - Explore │                                               │
│  - Activity│                                               │
│  - Profile │                                               │
│            │                                               │
│            │                                               │
│  [Forge]   │                                               │
│            │                                               │
├────────────┴───────────────────────────────────────────────┤
│                    Bottom Nav (Mobile)                     │
│     [Home]  [Explore]  [Forge]  [Activity]  [Profile]     │
└────────────────────────────────────────────────────────────┘
```

---

## 5. API Client Architecture

### HTTP Client Configuration

```typescript
// src/shared/api/api.ts
import ky from 'ky';

export const apiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  cache: 'no-store',
  timeout: 15_000,
  hooks: {
    beforeRequest: [attachAccessOrRefreshToken],
    afterResponse: [refreshAndRetryUnauthorizedRequest],
    beforeError: [parseApiError],
  },
});
```

### Authentication Flow

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  Login   │──────▶│   API    │──────▶│  Store   │
│  Form    │       │  /auth   │       │  Tokens  │
└──────────┘       └──────────┘       └──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Access Token (JWT) │
              │  Refresh Token      │
              └─────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Auto-refresh on    │
              │  401 responses      │
              └─────────────────────┘
```

---

## 6. Backend Architecture (Expected)

### Service Boundaries

| Service | Responsibility |
|---------|----------------|
| **Auth Service** | Registration, login, OAuth, JWT, sessions, OTP |
| **User Service** | Profile CRUD, interests, search status |
| **Matching Service** | Forge algorithm, compatibility scoring |
| **Group Service** | Group CRUD, membership, invites |
| **Plan Service** | Plan CRUD, proposals, voting, comments |
| **Chat Service** | Messages, reactions, attachments, read status |
| **Trust Service** | Rating aggregation, trust score calculation |
| **Notification Service** | Push, in-app, email notifications |

### Database Schema (Prisma)

The complete Prisma schema is in `prisma/schema.prisma`. Key entities:

```
User ─────────────────────────────────────────────────┐
  │                                                   │
  ├── UserInterest ──── Interest (self-referential)  │
  │                                                   │
  ├── Activity ──── Group ──── Plan                  │
  │                    │                              │
  │                    ├── GroupMember               │
  │                    ├── Chat ──── Message         │
  │                    └── Rating                    │
  │                                                   │
  ├── Friendship ──────────────────────────────────┘ │
  │       │                                          │
  │       └── Private Chat                           │
  │                                                   │
  ├── Notification                                   │
  │                                                   │
  └── Session / OtpCode                              │
```

---

## 7. Matching Algorithm (Conceptual)

### Scoring Formula

```
compatibility_score = 
    w1 * interest_similarity(user_a, user_b) +
    w2 * social_graph_proximity(user_a, user_b) +
    w3 * age_alignment(user_a, user_b) +
    w4 * trust_factor(user_a, user_b) +
    w5 * location_proximity(user_a, user_b)
```

### Weight Distribution (Example)

| Factor | Weight | Notes |
|--------|--------|-------|
| Interest similarity | 0.30 | Jaccard similarity on interest sets |
| Social graph | 0.25 | Mutual friends, friend-of-friend bonus |
| Age alignment | 0.15 | Gaussian decay from target age |
| Trust score | 0.20 | Average trust of both users |
| Location | 0.10 | Distance-based decay |

### Group Formation Process

```
1. User initiates Forge with activity preferences
2. System finds candidate users:
   - Active search status
   - Matching location/interests
   - Not recently declined
3. Greedy algorithm:
   a. Start with requesting user
   b. Add highest-scoring compatible user
   c. Recalculate group compatibility
   d. Repeat until group size reached
4. Return formed group or failure
```

---

## 8. Trust Score System

### Calculation Method

Exponential smoothing with recency bias:

```
new_trust = α * recent_rating + (1 - α) * previous_trust
```

Where:
- `α` = 0.2 (smoothing factor)
- Ratings are 1-5, normalized to 0-1
- Initial trust = 0.5

### Trust Impact

| Trust Level | Effect |
|-------------|--------|
| 0.0 - 0.3 | Low priority in matching, warning displayed |
| 0.3 - 0.5 | Normal matching, no special treatment |
| 0.5 - 0.7 | Slight priority boost |
| 0.7 - 0.9 | High priority, trusted badge |
| 0.9 - 1.0 | Premium matching status |

---

## 9. Security Considerations

### Authentication

- JWT access tokens (short-lived, 15 min)
- Refresh can use a stored refresh token or the backend refresh cookie, depending on response mode
- Automatic token refresh on 401
- Secure token storage (not localStorage)

### Authorization

- Route-level auth guards
- API-level permission checks
- Group membership verification for chat/plan actions

### Data Protection

- No sensitive data in frontend state
- HTTPS only
- Input sanitization via Zod schemas
- Rate limiting on API endpoints

---

## 10. Performance Optimizations

### Frontend

| Technique | Implementation |
|-----------|----------------|
| Code splitting | Lazy-loaded route pages |
| Bundle optimization | Vite tree-shaking |
| Image optimization | Lazy loading, proper sizing |
| Query caching | TanStack Query stale-while-revalidate |
| Virtual scrolling | For long message lists |

### API

| Technique | Implementation |
|-----------|----------------|
| Pagination | Cursor-based for messages |
| Caching | Redis for hot data |
| Indexing | PostgreSQL indexes on frequent queries |
| Batch operations | Bulk notification updates |

---

## 11. Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Fast lint pass for staged, unstaged, and untracked changed files
npm run lint:changed

# Full lint gate
npm run lint

# Build for production
npm run build
```

### Git Workflow

- Feature branches from `main`
- Pre-commit hooks: React Compiler tracking, Biome safe fixes, and Oxlint on staged files
- PR reviews required
- Conventional commits encouraged

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend REST API base URL, including `/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps key for location autocomplete |
| `VITE_GIPHY_API_KEY` | Giphy Web SDK key for chat GIF search |

Local development uses `http://localhost:6969/api/v1`. Production uses the
public browser path, for example `https://api.mkloz.com/teamforge/api/v1`.
Realtime still uses the `/realtime` Socket.IO namespace; the client derives the
transport path from `VITE_API_URL`, so that production API URL maps to
`/teamforge/socket.io`.

### Production PWA Release

```bash
VITE_API_URL=https://api.mkloz.com/teamforge/api/v1 \
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id \
VITE_GOOGLE_MAPS_API_KEY=your-production-maps-key \
VITE_GIPHY_API_KEY=your-production-giphy-key \
npm run pwa:release
```

The release command validates browser-facing environment values, builds the app,
and runs the PWA QA pass against `dist/`.

---

*For product vision, see `product-vision.md`. For feature specifications, see `feature-specifications.md`.*
