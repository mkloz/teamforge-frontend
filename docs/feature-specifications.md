# TeamForge - Feature Specifications

**Version 2.0 | Detailed Feature Documentation**

---

## Overview

This document provides detailed specifications for each core feature of TeamForge. Features are organized by user journey phase and include purpose, user stories, UI components, data requirements, and acceptance criteria.

---

## 1. Authentication & Onboarding

### 1.1 Authentication

**Purpose:** Enable secure user registration and login with email or social providers.

#### User Stories

- As a new user, I can register with my email and password
- As a new user, I can register using my Google account
- As a returning user, I can log in with my credentials
- As a user, I can request a password reset via email
- As a user, I receive an OTP to verify my email

#### Flows

**Email Registration:**
```
1. Enter email address
2. Enter password (min 8 chars, 1 uppercase, 1 number)
3. Receive OTP via email
4. Enter OTP to verify
5. Redirect to onboarding
```

**Google OAuth:**
```
1. Click "Continue with Google"
2. Google consent screen
3. Account created/linked
4. Redirect to onboarding (if new) or home (if returning)
```

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AuthPage` | `features/auth/auth-page.tsx` | Container for login/register views |
| `LoginForm` | `features/auth/components/` | Email/password login |
| `RegisterForm` | `features/auth/components/` | Multi-step registration |
| `OtpInput` | `features/auth/components/` | 6-digit OTP verification |
| `GoogleButton` | `features/auth/components/` | Google OAuth trigger |

#### Data Requirements

```typescript
interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}
```

---

### 1.2 Personality Test

**Purpose:** Collect user personality data to enable compatibility matching.

#### User Stories

- As a new user, I complete a questionnaire to determine my personality profile
- As a user, I see my results after completing the test
- As a user, I can retake the test from settings

#### Test Structure

- **Questions:** 50 IPIP-style questions
- **Scale:** 5-point Likert (Strongly Disagree to Strongly Agree)
- **Duration:** 5-8 minutes
- **Output:** Scores that inform matching

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PersonalityTestPage` | `features/onboarding/` | Main test container |
| `QuestionCard` | `features/onboarding/components/` | Individual question display |
| `ProgressBar` | `features/onboarding/components/` | Test progress indicator |
| `ResultCard` | `features/onboarding/components/` | Score visualization |

#### Scoring Logic

Location: `features/onboarding/utils/score-calculator.ts`

```typescript
interface PersonalityResult {
  scores: {
    openness: number;        // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}
```

---

### 1.3 Interest Selection

**Purpose:** Capture user interests for activity matching.

#### User Stories

- As a new user, I browse interest categories
- As a user, I select interests that match my hobbies
- As a user, I must select at least 5 interests to proceed
- As a user, I can search for specific interests

#### Interest Hierarchy

```
Category (e.g., "Sports")
└── Interest (e.g., "Basketball", "Tennis", "Swimming")
```

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `InterestsPage` | `features/onboarding/` | Main selection container |
| `CategorySection` | `features/onboarding/components/` | Category with interests |
| `InterestPill` | `features/onboarding/components/` | Selectable interest tag |
| `SearchBar` | `features/onboarding/components/` | Interest search |

#### Validation

- Minimum: 5 interests
- Maximum: 50 interests
- At least 2 different categories

---

## 2. Core Application

### 2.1 Home Dashboard

**Purpose:** Provide an overview of the user's current groups, upcoming plans, and activity.

#### User Stories

- As a user, I see my active groups on the home page
- As a user, I see upcoming plans chronologically
- As a user, I can quickly access the Forge wizard
- As a user, I see a prompt to create my first group if I have none

#### Sections

| Section | Content |
|---------|---------|
| **Welcome banner** | Personalized greeting, quick stats |
| **Active groups** | Cards for groups with upcoming/recent activity |
| **Upcoming plans** | Chronological list of confirmed plans |
| **Quick actions** | Forge button, explore link |
| **Empty state** | Prompt to forge first group |

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `HomePage` | `features/home/` | Dashboard container |
| `WelcomeBanner` | `features/home/components/` | Top greeting section |
| `GroupCard` | `features/home/components/` | Group summary card |
| `PlanListItem` | `features/home/components/` | Plan in timeline |
| `EmptyStateCard` | `features/home/components/` | No groups prompt |

---

### 2.2 Forge Wizard

**Purpose:** The core interaction - algorithmically form a compatible group for an activity.

#### User Stories

- As a user, I initiate the Forge process with one button
- As a user, I select or describe an activity
- As a user, I set plan details (date, location)
- As a user, I choose group size (4, 6, or 8)
- As a user, I receive an algorithmically formed group
- As a user, I can accept or decline the result
- As a user, I name my group and select an avatar

#### Wizard Steps

| Step | Name | Purpose |
|------|------|---------|
| 1 | **Activity** | Select what you want to do |
| 2 | **Plan** | Set date, time, location |
| 3 | **Preferences** | Group size, visibility |
| 4 | **Matching** | Algorithm runs, loading state |
| 5 | **Result** | View formed group or failure |
| 6 | **Identity** | Name group, select avatar |
| 7 | **Complete** | Confirmation, next steps |

#### Forge Modes

| Mode | Description |
|------|-------------|
| **Auto** | Algorithm selects all members |
| **Manual** | User invites specific friends |

#### Group Size Options

Groups support 2-16 members, with common presets:
- 2-4 members (intimate)
- 5-8 members (standard)
- 9-16 members (large events)

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ForgePage` | `features/forge/` | Wizard container |
| `ForgeStepIndicator` | `features/forge/components/` | Progress steps |
| `ActivitySelector` | `features/forge/components/` | Activity picker |
| `PlanForm` | `features/forge/components/` | Date/location form |
| `MatchingAnimation` | `features/forge/components/` | Loading visualization |
| `GroupResult` | `features/forge/components/` | Formed group display |
| `GroupIdentityForm` | `features/forge/components/` | Name/avatar selection |

#### State Management

Location: `features/forge/hooks/use-forge-wizard.ts`

```typescript
interface ForgeState {
  step: number;
  activity: {
    category: string;
    description: string;
  } | null;
  plan: {
    title: string;
    dateTime: Date | null;
    location: string | null;
    locationMode: 'IN_PERSON' | 'ONLINE';
    cost: 'FREE' | 'PAID';
  } | null;
  preferences: {
    groupSize: 4 | 6 | 8;
    visibility: 'PUBLIC' | 'FRIENDS_ONLY' | 'INVITE_ONLY';
    forgeMode: 'AUTO' | 'MANUAL';
  };
  result: {
    status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'FAILED';
    group: Group | null;
    reason: string | null;
  };
  identity: {
    name: string;
    avatar: string | null;
  };
}
```

---

### 2.3 Explore

**Purpose:** Discover and join existing groups created by others.

#### User Stories

- As a user, I browse open groups in my area
- As a user, I filter groups by category, size, and distance
- As a user, I see my compatibility score with each group
- As a user, I can request to join a group
- As a user, I can sort by match score, date, or recency

#### Filters

| Filter | Options |
|--------|---------|
| **Categories** | Multi-select from interest categories |
| **Size range** | Slider (2-8 members) |
| **Distance** | Slider (1-50+ km) |
| **Location mode** | Any, In-Person, Online |
| **Access** | All, Open, By Request |
| **Sort** | Match score, Soonest, Newest |

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ExplorePage` | `features/explore/` | Main explore view |
| `FilterPanel` | `features/explore/components/` | Filter controls |
| `GroupPreviewCard` | `features/explore/components/` | Group listing card |
| `MatchScoreBadge` | `features/explore/components/` | Compatibility indicator |
| `JoinRequestButton` | `features/explore/components/` | Join action |

#### Group Preview Card Content

- Group name and avatar
- Plan title and date
- Category icon
- Member count (current/max)
- Distance (if in-person)
- Match score percentage
- Cost indicator (Free/Paid)
- Access type (Open/Request)

---

### 2.4 Activity Feed

**Purpose:** Unified inbox for all conversations (groups and direct messages).

#### User Stories

- As a user, I see all my conversations in one list
- As a user, I see unread indicators for new messages
- As a user, I can switch between groups and direct messages
- As a user, I see conversation previews with last message
- As a user, I can search conversations

#### Conversation Types

| Type | Icon | Preview Shows |
|------|------|---------------|
| **Group** | Group avatar | Last message, member who sent |
| **Direct** | User avatar | Last message |

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ActivityPage` | `features/activity/` | Feed container |
| `ConversationList` | `features/activity/components/` | List of conversations |
| `ConversationItem` | `features/activity/components/` | Single conversation row |
| `ChatView` | `features/activity/components/` | Full chat interface |
| `MessageBubble` | `features/activity/components/` | Individual message |
| `MessageInput` | `features/activity/components/` | Compose message |

#### Message Types

| Type | Description |
|------|-------------|
| `TEXT` | Standard text message |
| `IMAGE` | Photo/image attachment |
| `VOICE` | Voice note with waveform |
| `FILE` | Document attachment |
| `SYSTEM` | System notification |
| `PLAN_UPDATE` | Plan change notification |

---

### 2.5 Group Management

**Purpose:** View and manage group details, members, and the associated plan.

#### User Stories

- As a group member, I view group details and members
- As a group admin, I can edit group name and avatar
- As a group admin, I can remove members
- As a group member, I can leave the group
- As a group member, I see the plan details
- As a group member, I can propose changes to the plan
- As a group member, I can vote on proposals
- As a group member, I rate other members after plan completion

#### Group Lifecycle

```
FORMING → PENDING → ACTIVE → PLANNING → COMPLETED
                              ↓
                          DISBANDED
```

#### Plan Collaboration

**Proposal Flow:**
```
1. Member proposes a change (e.g., new date)
2. Proposal visible to all members
3. Members vote (Approve/Reject)
4. Majority wins (50%+ approval)
5. Plan updated or proposal rejected
```

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `GroupDetailView` | `features/groups/components/` | Group info panel |
| `MemberList` | `features/groups/components/` | Member roster |
| `PlanCard` | `features/groups/components/` | Plan summary |
| `PlanProposalForm` | `features/groups/components/` | Create proposal |
| `ProposalVoteCard` | `features/groups/components/` | Vote interface |
| `RatingDialog` | `features/groups/components/` | Post-activity rating |

---

### 2.6 Profile

**Purpose:** Display user profile with personality insights and trust information.

#### User Stories

- As a user, I view my own profile
- As a user, I see my personality summary
- As a user, I see my trust score
- As a user, I see my interests
- As a user, I can edit my profile information
- As another user, I can view someone's public profile

#### Profile Sections

| Section | Content |
|---------|---------|
| **Header** | Avatar, name, bio, trust score |
| **Personality** | Visual representation of traits |
| **Interests** | Interest tags by category |
| **Activity** | Completed activities count, member since |

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ProfilePage` | `features/profile/` | Profile container |
| `ProfileHeader` | `features/profile/components/` | Top section |
| `PersonalityChart` | `features/profile/components/` | Trait visualization |
| `InterestCloud` | `features/profile/components/` | Interest display |
| `TrustScoreRing` | `features/profile/components/` | Trust indicator |
| `ProfileEditForm` | `features/profile/components/` | Edit modal |

---

### 2.7 Notifications

**Purpose:** Keep users informed about group activity, invites, and system events.

#### User Stories

- As a user, I see a notification badge when I have unread items
- As a user, I view notifications in a dropdown
- As a user, I can mark notifications as read
- As a user, I receive notifications for group invites
- As a user, I receive notifications for plan updates
- As a user, I receive notifications for new messages

#### Notification Types

| Type | Trigger | Action |
|------|---------|--------|
| `GROUP_FORMED` | Forge success | View group |
| `GROUP_INVITE` | Invited to group | Accept/decline |
| `PLAN_UPDATED` | Plan change | View plan |
| `PLAN_PROPOSAL` | New proposal | Vote |
| `NEW_MESSAGE` | Message received | Open chat |
| `FRIEND_REQUEST` | Friend request | Accept/decline |
| `RATING_REQUEST` | Activity completed | Rate members |

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `NotificationBell` | `features/notifications/` | Header icon + badge |
| `NotificationDrawer` | `features/notifications/` | Dropdown list |
| `NotificationItem` | `features/notifications/` | Single notification |

---

### 2.8 Settings

**Purpose:** Manage account preferences and app configuration.

#### User Stories

- As a user, I can update my profile information
- As a user, I can change my password
- As a user, I can manage notification preferences
- As a user, I can delete my account
- As a user, I can log out

#### Settings Sections

| Section | Options |
|---------|---------|
| **Profile** | Name, bio, avatar, location |
| **Account** | Email, password, linked accounts |
| **Notifications** | Push, email, in-app preferences |
| **Privacy** | Profile visibility, search status |
| **Data** | Export data, delete account |

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `SettingsPage` | `features/settings/` | Settings container |
| `SettingsSection` | `features/settings/components/` | Section wrapper |
| `ProfileSettings` | `features/settings/components/` | Profile form |
| `NotificationSettings` | `features/settings/components/` | Notification toggles |
| `AccountSettings` | `features/settings/components/` | Password, delete |

---

## 3. Cross-Cutting Features

### 3.1 App Shell

**Purpose:** Consistent navigation and layout across authenticated pages.

#### Components

| Component | Platform | Purpose |
|-----------|----------|---------|
| `AppLayout` | All | Main layout wrapper |
| `Sidebar` | Desktop | Left navigation |
| `TopBar` | All | Header with search, notifications |
| `BottomNav` | Mobile | Bottom tab bar |
| `ForgeTrigger` | All | Prominent Forge button |

#### Navigation Items

| Item | Icon | Route |
|------|------|-------|
| Home | Home | `/home` |
| Explore | Compass | `/explore` |
| Forge | Plus | `/forge` |
| Activity | MessageSquare | `/activity` |
| Profile | User | `/profile` |

---

### 3.2 Direct Messages

**Purpose:** 1:1 private messaging between friends.

#### User Stories

- As a user, I can message a friend directly
- As a user, I see our conversation history
- As a user, I receive notifications for new DMs

#### Relationship to Friendships

- DMs are only available between accepted friends
- A private Chat is created when friendship is accepted
- Chat persists even if friendship is removed

---

### 3.3 Friendships

**Purpose:** Establish trusted connections that influence matching.

#### User Stories

- As a user, I can send a friend request
- As a user, I can accept or decline requests
- As a user, I see my friends list
- As a user, friends appear with priority in matching

#### Friendship Flow

```
1. User A sends request to User B
2. User B receives notification
3. User B accepts or declines
4. If accepted: Private chat created, social graph updated
```

---

## 4. Future Features (Roadmap)

### Premium Tier

- Unlimited daily Forge searches
- Advanced matching filters
- Priority queue placement
- Detailed compatibility breakdowns

### Enhanced Discovery

- Activity-based search
- Location-based discovery feed
- Seasonal/event-based grouping

### Social Features

- User profiles visible in Explore
- Follow without friending
- Public activity history (opt-in)

### Integrations

- Calendar sync (Google, Apple)
- Location sharing during activities
- Photo sharing post-activity

---

*For technical architecture, see `architecture-guide.md`. For API details, see `api-data-models.md`.*
