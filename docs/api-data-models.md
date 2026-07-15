# TeamForge - API & Data Models Guide

**Version 2.0 | Backend Contract Documentation**

---

## Overview

This document defines the data models (based on the Prisma schema) and the REST API contract between the frontend and backend. The Prisma schema is located at `prisma/schema.prisma`.

For exact request/response schemas, status codes, and generated endpoint metadata, treat `docs/open-api.yaml` as the source of truth.

REST paths in this document omit the global `/api/v1` prefix. For example,
`/auth/login` is served locally as `http://localhost:6969/api/v1/auth/login`.

---

## 1. Core Domain Models

### 1.1 User

The central entity representing a registered user.

```typescript
interface User {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    authProvider: 'EMAIL' | 'GOOGLE';
    googleId?: string | null;
    emailVerified: boolean;
    createdAt: string; // ISO 8601
    updatedAt: string;

    // Profile
    age: number | null;
    gender: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER' | null;
    city: string | null;
    personalityType: string | null; // 4-letter type code (e.g., "INFP", "ESTJ")
    oceanO: number | null; // Openness
    oceanC: number | null; // Conscientiousness
    oceanE: number | null; // Extraversion
    oceanA: number | null; // Agreeableness
    oceanN: number | null; // Neuroticism

    // Matching
    searchStatus: 'IDLE' | 'SEARCHING';
    trustScore: number; // 0.0 - 1.0
    profileComplete: boolean;

    // Relations (when expanded)
    interests?: Interest[];
}
```

### 1.2 Interest

Hierarchical interest system for matching.

```typescript
interface Interest {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    sortOrder: number;
    isActive: boolean;

    // Hierarchy
    parentId: string | null;
    parent?: Interest;
    children?: Interest[];

    // Search
    aliases: string[];
}
```

**Hierarchy Example:**

```
Sports (parent: null)
├── Basketball (parent: Sports)
├── Tennis (parent: Sports)
└── Swimming (parent: Sports)
```

### 1.3 Activity

User-initiated activity request that leads to group formation.

```typescript
interface Activity {
    id: string;
    title: string;
    description: string | null;
    city: string | null;
    locationLat: number | null;
    locationLng: number | null;
    visibility: 'PUBLIC' | 'FRIENDS_ONLY' | 'INVITE_ONLY';
    access: 'OPEN' | 'BY_REQUEST';
    forgeMode: 'AUTO' | 'MANUAL';
    status: 'OPEN' | 'MATCHING' | 'MATCHED' | 'CLOSED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;

    creatorId: string;
    creator?: User;

    interests?: Interest[];
    group?: Group;
}
```

### 1.4 Group

Formed group of users around an activity.

```typescript
interface Group {
    id: string;
    name: string;
    description: string | null;
    avatar: string | null;
    status:
        | 'FORMING'
        | 'PENDING'
        | 'ACTIVE'
        | 'PLANNING'
        | 'COMPLETED'
        | 'DISBANDED';
    maxMembers: number; // Range: 2-8
    createdAt: string;
    updatedAt: string;
    disbandedAt: string | null;

    activityId: string;
    activity?: Activity;

    members?: GroupMember[];
    plan?: Plan;
    chat?: Chat;
}
```

### 1.5 GroupMember

Junction table for group membership with metadata.

```typescript
interface GroupMember {
    userId: string;
    groupId: string;
    role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
    joinedAt: string;
    leftAt: string | null;
    compatibilityScore: number | null;

    user?: User;
    group?: Group;
}
```

### 1.6 Plan

The concrete plan associated with a group.

```typescript
interface Plan {
    id: string;
    title: string;
    description: string | null;
    category: PlanCategory;
    coverImage: string | null;
    status:
        | 'DRAFT'
        | 'PROPOSED'
        | 'CONFIRMED'
        | 'IN_PROGRESS'
        | 'COMPLETED'
        | 'CANCELLED';

    dateTime: string | null; // ISO 8601

    locationMode: 'IN_PERSON' | 'ONLINE' | 'TBD';
    location: string | null;
    locationLat: number | null;
    locationLng: number | null;

    cost: 'FREE' | 'PAID';
    costAmount: number | null;
    costDetails: string | null;

    completedAt: string | null;
    cancelledAt: string | null;
    createdAt: string;
    updatedAt: string;

    groupId: string;
    group?: Group;

    proposals?: PlanProposal[];
    comments?: PlanComment[];
}

type PlanCategory =
    | 'TECH'
    | 'SPORTS'
    | 'ARTS'
    | 'SOCIAL'
    | 'OUTDOORS'
    | 'LEARNING'
    | 'MUSIC'
    | 'FOOD'
    | 'GAMING'
    | 'WELLNESS'
    | 'TRAVEL'
    | 'OTHER';
```

### 1.7 Chat & Message

Messaging infrastructure for groups and direct messages.

```typescript
interface Chat {
    id: string;
    type: 'GROUP' | 'PRIVATE';
    createdAt: string;

    groupId: string | null;

    participants?: ChatParticipant[];
    messages?: Message[];
}

interface Message {
    id: string;
    type: 'TEXT' | 'IMAGE' | 'VOICE' | 'FILE' | 'SYSTEM' | 'PLAN_UPDATE';
    content: string;
    status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
    isEdited: boolean;
    isPinned: boolean;
    createdAt: string;
    editedAt: string | null;
    deletedAt: string | null;

    chatId: string;
    senderId: string;
    replyToId: string | null;

    sender?: User;
    replyTo?: Message;
    reactions?: Reaction[];
    attachments?: Attachment[];
}

interface Attachment {
    id: string;
    type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
    url: string;
    name: string | null;
    size: number | null;
    mimeType: string | null;
    thumbnailUrl: string | null;
    duration: number | null; // For audio/video
    waveform: number[]; // For voice notes
    createdAt: string;
}

interface Reaction {
    emoji: string;
    createdAt: string;
    messageId: string;
    userId: string;
    user?: User;
}
```

### 1.8 Friendship

Bidirectional friend relationship.

```typescript
interface Friendship {
    requesterId: string;
    receiverId: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
    createdAt: string;
    updatedAt: string;

    privateChatId: string | null;

    requester?: User;
    receiver?: User;
    privateChat?: Chat;
}
```

### 1.9 Rating

Post-activity trust rating.

```typescript
interface Rating {
    id: string;
    score: number; // 1-5
    comment: string | null;
    createdAt: string;

    raterId: string;
    rateeId: string;
    groupId: string;

    rater?: User;
    ratee?: User;
    group?: Group;
}
```

### 1.10 Notification

In-app notification.

```typescript
interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string | null;
    avatarUrl: string | null;
    isRead: boolean;
    createdAt: string;

    entityType:
        | 'USER'
        | 'GROUP'
        | 'PLAN'
        | 'ACTIVITY'
        | 'MESSAGE'
        | 'INVITE'
        | null;
    entityId: string | null;

    receiverId: string;
}

type NotificationType =
    | 'FRIEND_REQUEST'
    | 'FRIEND_ACCEPTED'
    | 'GROUP_FORMED'
    | 'GROUP_INVITE'
    | 'GROUP_JOIN_REQUEST'
    | 'GROUP_JOIN_APPROVED'
    | 'GROUP_MEMBER_LEFT'
    | 'GROUP_DISBANDED'
    | 'PLAN_CREATED'
    | 'PLAN_CONFIRMED'
    | 'PLAN_UPDATED'
    | 'PLAN_PROPOSAL'
    | 'PLAN_STARTING_SOON'
    | 'PLAN_COMPLETED'
    | 'PLAN_CANCELLED'
    | 'NEW_MESSAGE'
    | 'MESSAGE_MENTION'
    | 'RATING_REQUEST'
    | 'RATING_RECEIVED'
    | 'SYSTEM_ANNOUNCEMENT'
    | 'ACCOUNT_SECURITY';
```

### 1.11 WebPushSubscription

Browser push subscription owned by the notifications module.

```typescript
interface WebPushSubscription {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent: string | null;
    disabledAt: string | null;
    createdAt: string;
    updatedAt: string;

    userId: string;
}
```

---

## 2. API Endpoints

### 2.1 Authentication

| Method | Endpoint                         | Description               |
| ------ | -------------------------------- | ------------------------- |
| `POST` | `/auth/register`                 | Register new user         |
| `POST` | `/auth/login`                    | Login with credentials    |
| `POST` | `/auth/google/login`             | Login with Google OAuth   |
| `POST` | `/auth/refresh`                  | Refresh access token      |
| `POST` | `/auth/logout`                   | Invalidate session        |
| `GET`  | `/auth/sessions`                 | List active sessions      |
| `POST` | `/auth/sessions/:id/revoke`      | Revoke a session          |
| `POST` | `/auth/sessions/revoke-others`   | Revoke other sessions     |
| `POST` | `/auth/send-reset-password-link` | Request password reset    |
| `POST` | `/auth/reset-password`           | Reset password with token |
| `POST` | `/auth/activate/:token`          | Activate account          |
| `POST` | `/auth/verify-email-otp`         | Verify email with OTP     |
| `POST` | `/auth/resend-email-otp`         | Resend verification OTP   |

#### Register

```typescript
// POST /auth/register
interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

interface RegisterResponse {
    message: string;
    userId: string;
}
```

#### Login

```typescript
// POST /auth/login
interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
```

#### Verify Email

```typescript
// POST /auth/verify-email-otp
interface VerifyEmailRequest {
    userId: string;
    code: string;
}

interface VerifyEmailResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
```

---

### 2.2 Users

| Method  | Endpoint              | Description                  |
| ------- | --------------------- | ---------------------------- |
| `GET`   | `/users/me`           | Get current user profile     |
| `PATCH` | `/users/me`           | Update current user          |
| `PATCH` | `/users/me/avatar`    | Upload or replace avatar     |
| `GET`   | `/users/:id`          | Get user by ID (public view) |
| `POST`  | `/users/me/interests` | Set user interests           |

#### Update User

```typescript
// PATCH /users/me
interface UpdateUserRequest {
    name?: string;
    bio?: string;
    avatar?: string;
    age?: number;
    gender?: Gender;
    city?: string;
    searchStatus?: SearchStatus;
}

interface UpdateUserResponse {
    user: User;
}
```

#### Set Interests

```typescript
// POST /users/me/interests
interface SetInterestsRequest {
    interestIds: string[];
}

interface SetInterestsResponse {
    interests: Interest[];
}
```

---

### 2.3 Interests

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| `GET`  | `/interests`            | List all interests        |
| `GET`  | `/interests/categories` | List top-level categories |
| `GET`  | `/interests/search`     | Search interests          |

#### List Interests

```typescript
// GET /interests?parentId=null (for categories)
interface ListInterestsResponse {
    interests: Interest[];
}
```

---

### 2.4 Activities & Forge

| Method   | Endpoint                | Description                   |
| -------- | ----------------------- | ----------------------------- |
| `POST`   | `/activities`           | Create activity (start Forge) |
| `GET`    | `/activities/:id`       | Get activity details          |
| `POST`   | `/activities/:id/forge` | Execute matching algorithm    |
| `DELETE` | `/activities/:id`       | Cancel activity               |

#### Create Activity

```typescript
// POST /activities
interface CreateActivityRequest {
    title: string;
    description?: string;
    city?: string;
    locationLat?: number;
    locationLng?: number;
    visibility: ActivityVisibility;
    access?: 'OPEN' | 'BY_REQUEST';
    forgeMode: ForgeMode;
    interestIds: string[];
}

interface CreateActivityResponse {
    activity: Activity;
}
```

#### Execute Forge

```typescript
// POST /activities/:id/forge
interface ForgeRequest {
    groupSize: number; // 2-8
    plan: {
        title: string;
        description?: string;
        category: PlanCategory;
        dateTime?: string;
        locationMode: LocationMode; // Including 'TBD'
        location?: string;
        locationLat?: number;
        locationLng?: number;
        cost: CostType;
        costAmount?: number;
        costDetails?: string;
    };
}

interface ForgeResponse {
    success: boolean;
    group?: Group; // If success
    reason?: string; // If failed
}
```

---

### 2.5 Groups

| Method  | Endpoint                    | Description           |
| ------- | --------------------------- | --------------------- |
| `GET`   | `/groups`                   | List user's groups    |
| `GET`   | `/groups/:id`               | Get group details     |
| `PATCH` | `/groups/:id`               | Update group (admin)  |
| `POST`  | `/groups/:id/leave`         | Leave group           |
| `POST`  | `/groups/:id/remove-member` | Remove member (admin) |
| `POST`  | `/groups/:id/disband`       | Disband group (admin) |

#### List Groups

```typescript
// GET /groups?status=ACTIVE
interface ListGroupsResponse {
    groups: Group[];
}
```

#### Update Group

```typescript
// PATCH /groups/:id
interface UpdateGroupRequest {
    name?: string;
    description?: string;
    avatar?: string;
}

interface UpdateGroupResponse {
    group: Group;
}
```

---

### 2.6 Explore

| Method | Endpoint                   | Description                   |
| ------ | -------------------------- | ----------------------------- |
| `GET`  | `/explore/groups`          | Browse joinable groups        |
| `POST` | `/explore/groups/:id/join` | Join or request to join group |

#### Explore Groups

```typescript
// GET /explore/groups?categories=SPORTS,TECH&minMembers=2&maxMembers=6&maxDistanceKm=10&locationMode=IN_PERSON&access=OPEN&sortBy=MATCH&page=1&limit=20
interface ExploreGroupsRequest {
    search?: string;
    city?: string;
    category?: PlanCategory;
    categories?: string[];
    access?: 'OPEN' | 'BY_REQUEST';
    locationMode?: 'IN_PERSON' | 'ONLINE' | 'TBD';
    startsAfter?: string;
    startsBefore?: string;
    minMembers?: number;
    maxMembers?: number;
    maxDistanceKm?: number;
    sortBy?: 'MATCH' | 'NEWEST' | 'SOONEST';
    page?: number;
    limit?: number;
}

interface ExploreGroupsResponse {
    items: ExploreGroupPreview[];
    meta: {
        totalItemsCount: number;
        itemsPerPage: number;
        currentPage: number;
        totalPages: number;
    };
    insight: {
        summary: string;
        bullets: string[];
    };
}

interface ExploreGroupPreview {
    id: string;
    name: string;
    avatar: string | null;
    status: GroupStatus;
    activeMembersCount: number;
    maxMembers: number;
    access: 'OPEN' | 'BY_REQUEST';
    activity: {
        id: string;
        title: string;
        city: string | null;
        interests: Interest[];
    };
    plan: null | {
        id: string;
        title: string;
        dateTime: string | null;
        category: PlanCategory;
        locationMode: LocationMode;
        cost: CostType;
    };
    compatibility: {
        interestOverlap: number;
        personalityCompatibility: number;
        cityAlignment: number;
        ageAlignment: number;
        trustScore: number;
        friendshipProximity: number;
        total: number;
    };
}
```

---

### 2.7 Plans

| Method  | Endpoint              | Description         |
| ------- | --------------------- | ------------------- |
| `GET`   | `/plans/:id`          | Get plan details    |
| `PATCH` | `/plans/:id`          | Update plan (admin) |
| `POST`  | `/plans/:id/confirm`  | Confirm plan        |
| `POST`  | `/plans/:id/complete` | Mark plan complete  |
| `POST`  | `/plans/:id/cancel`   | Cancel plan         |

#### Update Plan

```typescript
// PATCH /plans/:id
interface UpdatePlanRequest {
    title?: string;
    description?: string;
    category?: PlanCategory;
    dateTime?: string;
    locationMode?: LocationMode;
    location?: string;
    locationLat?: number;
    locationLng?: number;
    cost?: CostType;
    costAmount?: number;
    costDetails?: string;
}
```

---

### 2.8 Plan Proposals

| Method   | Endpoint               | Description             |
| -------- | ---------------------- | ----------------------- |
| `GET`    | `/plans/:id/proposals` | List proposals for plan |
| `POST`   | `/plans/:id/proposals` | Create proposal         |
| `POST`   | `/proposals/:id/vote`  | Vote on proposal        |
| `DELETE` | `/proposals/:id`       | Withdraw proposal       |

#### Create Proposal

```typescript
// POST /plans/:id/proposals
interface CreateProposalRequest {
    field:
        | 'TITLE'
        | 'DESCRIPTION'
        | 'DATE_TIME'
        | 'LOCATION'
        | 'COST'
        | 'CATEGORY';
    proposedValue: string;
}

interface CreateProposalResponse {
    proposal: PlanProposal;
}
```

#### Vote on Proposal

```typescript
// POST /proposals/:id/vote
interface VoteRequest {
    vote: 'APPROVE' | 'REJECT';
}
```

---

### 2.9 Chat & Messages

| Method   | Endpoint                                   | Description              |
| -------- | ------------------------------------------ | ------------------------ |
| `GET`    | `/chats`                                   | List user's chats        |
| `GET`    | `/chats/:id`                               | Get chat with messages   |
| `GET`    | `/chats/:id/messages`                      | Get messages (paginated) |
| `POST`   | `/chats/:id/messages`                      | Send message             |
| `PATCH`  | `/chats/:id/messages/:messageId`           | Edit message             |
| `DELETE` | `/chats/:id/messages/:messageId`           | Delete message           |
| `POST`   | `/chats/:id/messages/:messageId/pin`       | Pin message              |
| `DELETE` | `/chats/:id/messages/:messageId/pin`       | Unpin message            |
| `POST`   | `/chats/:id/messages/:messageId/reactions` | Add reaction             |
| `DELETE` | `/chats/:id/messages/:messageId/reactions` | Remove reaction          |
| `POST`   | `/chats/:id/read`                          | Mark chat as read        |

#### List Chats

```typescript
// GET /chats
interface ListChatsResponse {
    chats: ChatPreview[];
}

interface ChatPreview {
    id: string;
    type: ChatType;
    name: string;
    avatar: string | null;
    lastMessage: {
        content: string;
        senderName: string;
        createdAt: string;
    } | null;
    unreadCount: number;
}
```

#### Send Message

```typescript
// POST /chats/:id/messages
interface SendMessageRequest {
    type: MessageType;
    content: string;
    replyToId?: string;
    attachments?: {
        type: AttachmentType;
        url: string;
        name?: string;
        size?: number;
        mimeType?: string;
        duration?: number;
        waveform?: number[];
    }[];
}

interface SendMessageResponse {
    message: Message;
}
```

#### Get Messages (Paginated)

```typescript
// GET /chats/:id/messages?cursor=xxx&limit=50
interface GetMessagesResponse {
    messages: Message[];
    nextCursor: string | null;
    prevCursor: string | null;
}
```

---

### 2.10 Friendships

| Method   | Endpoint                        | Description            |
| -------- | ------------------------------- | ---------------------- |
| `GET`    | `/friends`                      | List friends           |
| `GET`    | `/friends/requests/incoming`    | List incoming requests |
| `GET`    | `/friends/requests/outgoing`    | List outgoing requests |
| `GET`    | `/friends/blocked`              | List blocked users     |
| `POST`   | `/friends/requests`             | Send friend request    |
| `POST`   | `/friends/requests/:id/accept`  | Accept request         |
| `POST`   | `/friends/requests/:id/decline` | Decline request        |
| `DELETE` | `/friends/:id`                  | Remove friend          |
| `POST`   | `/friends/:id/block`            | Block user             |
| `DELETE` | `/friends/:id/block`            | Unblock user           |

#### Send Friend Request

```typescript
// POST /friends/requests
interface FriendRequestRequest {
    userId: string;
}
```

---

### 2.11 Ratings

| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| `GET`  | `/ratings/groups/:id` | Get ratings for group |
| `POST` | `/ratings`            | Submit rating         |

#### Submit Rating

```typescript
// POST /ratings
interface SubmitRatingRequest {
    groupId: string;
    rateeId: string;
    score: number; // 1-5
    comment?: string;
}
```

---

### 2.12 Invites

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| `GET`  | `/invites/received`    | List received invites |
| `GET`  | `/invites/sent`        | List sent invites     |
| `POST` | `/invites`             | Send or resend invite |
| `POST` | `/invites/:id/accept`  | Accept invite         |
| `POST` | `/invites/:id/decline` | Decline invite        |

#### Send Invite

```typescript
// POST /invites
interface SendInviteRequest {
    groupId: string;
    inviteeId: string;
    type?: 'FRIEND_INVITE' | 'DIRECT_INVITE';
    message?: string;
}
```

---

### 2.13 Notifications

| Method | Endpoint                      | Description        |
| ------ | ----------------------------- | ------------------ |
| `GET`  | `/notifications`              | List notifications |
| `POST` | `/notifications/:id/read`     | Mark as read       |
| `POST` | `/notifications/:id/unread`   | Mark as unread     |
| `POST` | `/notifications/read-all`     | Mark all as read   |
| `GET`  | `/notifications/unread-count` | Get unread count   |
| `GET`  | `/notifications/web-push/public-key` | Get public VAPID key state |
| `GET`  | `/notifications/web-push/subscriptions` | List active browser push subscriptions |
| `POST` | `/notifications/web-push/subscriptions` | Create or refresh a browser push subscription |
| `DELETE` | `/notifications/web-push/subscriptions` | Disable one browser push subscription |
| `POST` | `/notifications/web-push/test` | Send a test web push notification |

#### List Notifications

```typescript
// GET /notifications?unreadOnly=false&cursor=xxx&limit=20
interface ListNotificationsResponse {
    notifications: Notification[];
    nextCursor: string | null;
    unreadCount: number;
}
```

---

## 3. Error Responses

### Standard Error Format

```typescript
interface ErrorResponse {
    status: number;
    message: string;
    timestamp: string;
    method: string;
    path?: string; // included outside production
    requestId?: string;
}
```

### Common Error Codes

| Code               | HTTP Status | Description              |
| ------------------ | ----------- | ------------------------ |
| `UNAUTHORIZED`     | 401         | Missing or invalid token |
| `FORBIDDEN`        | 403         | Insufficient permissions |
| `NOT_FOUND`        | 404         | Resource not found       |
| `VALIDATION_ERROR` | 400         | Invalid request data     |
| `CONFLICT`         | 409         | Resource already exists  |
| `RATE_LIMITED`     | 429         | Too many requests        |
| `INTERNAL_ERROR`   | 500         | Server error             |

---

## 4. Pagination

Most paginated list endpoints use page/limit pagination:

```typescript
interface PaginatedRequest {
    page?: number;
    limit?: number;
}

interface PaginatedResponse<T> {
    items: T[];
    meta: {
        totalItemsCount: number;
        itemsPerPage: number;
        currentPage: number;
        totalPages: number;
    };
}
```

Message history and Explore results use cursor pagination because both load
additional items incrementally:

```typescript
interface CursorPaginatedResponse<T> {
    items: T[];
    nextCursor: string | null;
    prevCursor?: string | null;
}
```

---

## 5. Realtime Events (Socket.IO)

### Connection

TeamForge uses Socket.IO, not a raw WebSocket endpoint.

Local development:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:6969/realtime', {
    auth: {
        token: accessToken,
    },
    path: '/socket.io',
});
```

Current production path when the frontend uses
`VITE_API_URL=https://arm-api.mkloz.com/teamforge/api/v1`:

```typescript
io('https://arm-api.mkloz.com/realtime', {
    auth: {
        token: accessToken,
    },
    path: '/teamforge/socket.io',
});
```

### Client Events

| Event | Payload | Description |
| ----- | ------- | ----------- |
| `chat.subscribe` | `{ chatId }` | Join a chat room |
| `chat.unsubscribe` | `{ chatId }` | Leave a chat room |
| `chat.typing` | `{ chatId, isTyping }` | Broadcast typing state to chat participants |
| `plan.subscribe` | `{ planId }` | Join a plan room |
| `plan.unsubscribe` | `{ planId }` | Leave a plan room |

### Event Types

| Event | Payload | Description |
| ----- | ------- | ----------- |
| `realtime.ready` | `{ userId }` | Socket authenticated and ready |
| `message.new` | `{ chatId, message, entityKey, entityVersion, eventId, occurredAt }` | New message in chat |
| `message.updated` | `{ chatId, message, entityKey, entityVersion, eventId, occurredAt }` | Message edited, pinned, reacted to, read-state related, or otherwise updated |
| `chat.read` | `{ userId, chatId, chat, entityKey, entityVersion, eventId, occurredAt }` | Chat read state changed |
| `chat.typing` | `{ chatId, isTyping, user }` | Another participant is typing or stopped typing |
| `presence.changed` | `{ onlineStatus, user }` | Friend/direct-chat participant presence changed |
| `notification.new` | `{ notification, entityKey, entityVersion, eventId, occurredAt }` | New inbox notification |
| `group.updated` | `{ group, reason, entityKey, entityVersion, eventId, occurredAt }` | Group details or lifecycle changed |
| `plan.updated` | `{ groupId, planId, kind, plan, proposal, entityKey, entityVersion, eventId, occurredAt }` | Plan or proposal changed |

Current `plan.updated` kinds:

```text
updated
confirmed
completed
cancelled
proposal_created
proposal_voted
proposal_approved
proposal_rejected
proposal_withdrawn
```

Current `group.updated` reasons:

```text
updated
member_left
member_removed
disbanded
```

---

_For product vision, see `product-vision.md`. For feature specifications, see `feature-specifications.md`._
