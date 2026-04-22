# TeamForge - API & Data Models Guide

**Version 2.0 | Backend Contract Documentation**

---

## Overview

This document defines the data models (based on the Prisma schema) and the expected REST API contract between the frontend and backend. The Prisma schema is located at `prisma/schema.prisma`.

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
  status: 'FORMING' | 'PENDING' | 'ACTIVE' | 'PLANNING' | 'COMPLETED' | 'DISBANDED';
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
  status: 'DRAFT' | 'PROPOSED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  
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
  | 'TECH' | 'SPORTS' | 'ARTS' | 'SOCIAL' 
  | 'OUTDOORS' | 'LEARNING' | 'MUSIC' 
  | 'FOOD' | 'GAMING' | 'WELLNESS' | 'TRAVEL' | 'OTHER';
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
  waveform: number[];      // For voice notes
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
  
  entityType: 'USER' | 'GROUP' | 'PLAN' | 'ACTIVITY' | 'MESSAGE' | 'INVITE' | null;
  entityId: string | null;
  
  receiverId: string;
}

type NotificationType = 
  | 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED'
  | 'GROUP_FORMED' | 'GROUP_INVITE' | 'GROUP_JOIN_REQUEST' 
  | 'GROUP_JOIN_APPROVED' | 'GROUP_MEMBER_LEFT' | 'GROUP_DISBANDED'
  | 'PLAN_CREATED' | 'PLAN_CONFIRMED' | 'PLAN_UPDATED' 
  | 'PLAN_PROPOSAL' | 'PLAN_STARTING_SOON' | 'PLAN_COMPLETED' | 'PLAN_CANCELLED'
  | 'NEW_MESSAGE' | 'MESSAGE_MENTION'
  | 'RATING_REQUEST' | 'RATING_RECEIVED'
  | 'SYSTEM_ANNOUNCEMENT' | 'ACCOUNT_SECURITY';
```

---

## 2. API Endpoints

### 2.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login with credentials |
| `POST` | `/auth/google` | Login with Google OAuth |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Invalidate session |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset password with token |
| `POST` | `/auth/verify-email` | Verify email with OTP |
| `POST` | `/auth/resend-otp` | Resend verification OTP |

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
// POST /auth/verify-email
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users/me` | Get current user profile |
| `PATCH` | `/users/me` | Update current user |
| `GET` | `/users/:id` | Get user by ID (public view) |
| `POST` | `/users/me/interests` | Set user interests |
| `GET` | `/users/me/interests` | Get user interests |
| `PATCH` | `/users/me/personality` | Update personality scores |
| `DELETE` | `/users/me` | Delete account |

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/interests` | List all interests |
| `GET` | `/interests/categories` | List top-level categories |
| `GET` | `/interests/:id` | Get interest by ID |
| `GET` | `/interests/search` | Search interests |

#### List Interests

```typescript
// GET /interests?parentId=null (for categories)
interface ListInterestsResponse {
  interests: Interest[];
}
```

---

### 2.4 Activities & Forge

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/activities` | Create activity (start Forge) |
| `GET` | `/activities/:id` | Get activity details |
| `POST` | `/activities/:id/forge` | Execute matching algorithm |
| `DELETE` | `/activities/:id` | Cancel activity |

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
  groupSize: number; // 2-16
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
  group?: Group;  // If success
  reason?: string; // If failed
}
```

---

### 2.5 Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/groups` | List user's groups |
| `GET` | `/groups/:id` | Get group details |
| `PATCH` | `/groups/:id` | Update group (admin) |
| `POST` | `/groups/:id/leave` | Leave group |
| `DELETE` | `/groups/:id/members/:userId` | Remove member (admin) |
| `POST` | `/groups/:id/disband` | Disband group (admin) |

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/explore/groups` | Browse joinable groups |
| `POST` | `/groups/:id/join-request` | Request to join group |

#### Explore Groups

```typescript
// GET /explore/groups?categories=SPORTS,TECH&minSize=2&maxSize=6&distance=10&locationMode=IN_PERSON&access=OPEN&sortBy=match
interface ExploreGroupsRequest {
  categories?: string[];
  minSize?: number;
  maxSize?: number;
  distance?: number;
  locationMode?: 'IN_PERSON' | 'ONLINE' | 'ANY';
  access?: 'OPEN' | 'BY_REQUEST' | 'ALL';
  sortBy?: 'match' | 'soonest' | 'newest';
  cursor?: string;
  limit?: number;
}

interface ExploreGroupsResponse {
  groups: GroupPreview[];
  nextCursor: string | null;
}

interface GroupPreview {
  id: string;
  name: string;
  avatar: string | null;
  matchScore: number;
  plan: {
    title: string;
    dateTime: string;
    category: PlanCategory;
    locationMode: LocationMode;
    cost: CostType;
  };
  currentSize: number;
  maxMembers: number;
  access: 'OPEN' | 'BY_REQUEST';
  distance: number | null;
}
```

---

### 2.7 Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/plans/:id` | Get plan details |
| `PATCH` | `/plans/:id` | Update plan (admin) |
| `POST` | `/plans/:id/confirm` | Confirm plan |
| `POST` | `/plans/:id/complete` | Mark plan complete |
| `POST` | `/plans/:id/cancel` | Cancel plan |

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/plans/:id/proposals` | List proposals for plan |
| `POST` | `/plans/:id/proposals` | Create proposal |
| `POST` | `/proposals/:id/vote` | Vote on proposal |
| `DELETE` | `/proposals/:id` | Withdraw proposal |

#### Create Proposal

```typescript
// POST /plans/:id/proposals
interface CreateProposalRequest {
  field: 'TITLE' | 'DESCRIPTION' | 'DATE_TIME' | 'LOCATION' | 'COST' | 'CATEGORY';
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/chats` | List user's chats |
| `GET` | `/chats/:id` | Get chat with messages |
| `GET` | `/chats/:id/messages` | Get messages (paginated) |
| `POST` | `/chats/:id/messages` | Send message |
| `PATCH` | `/messages/:id` | Edit message |
| `DELETE` | `/messages/:id` | Delete message |
| `POST` | `/messages/:id/reactions` | Add reaction |
| `DELETE` | `/messages/:id/reactions/:emoji` | Remove reaction |
| `POST` | `/chats/:id/read` | Mark chat as read |

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/friends` | List friends |
| `GET` | `/friends/requests` | List pending requests |
| `POST` | `/friends/request` | Send friend request |
| `POST` | `/friends/:id/accept` | Accept request |
| `POST` | `/friends/:id/decline` | Decline request |
| `DELETE` | `/friends/:id` | Remove friend |
| `POST` | `/friends/:id/block` | Block user |

#### Send Friend Request

```typescript
// POST /friends/request
interface FriendRequestRequest {
  userId: string;
}
```

---

### 2.11 Ratings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/groups/:id/ratings` | Get ratings for group |
| `POST` | `/groups/:id/ratings` | Submit rating |

#### Submit Rating

```typescript
// POST /groups/:id/ratings
interface SubmitRatingRequest {
  rateeId: string;
  score: number; // 1-5
  comment?: string;
}
```

---

### 2.12 Invites

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/invites` | List received invites |
| `POST` | `/groups/:id/invite` | Send invite |
| `POST` | `/invites/:id/accept` | Accept invite |
| `POST` | `/invites/:id/decline` | Decline invite |

#### Send Invite

```typescript
// POST /groups/:id/invite
interface SendInviteRequest {
  userId: string;
  message?: string;
}
```

---

### 2.13 Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notifications` | List notifications |
| `POST` | `/notifications/:id/read` | Mark as read |
| `POST` | `/notifications/read-all` | Mark all as read |
| `GET` | `/notifications/unread-count` | Get unread count |

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
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>; // Validation errors
  };
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 4. Pagination

All list endpoints support cursor-based pagination:

```typescript
interface PaginatedRequest {
  cursor?: string;
  limit?: number; // Default: 20, Max: 100
}

interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  prevCursor?: string | null;
  total?: number;
}
```

---

## 5. Real-time Events (WebSocket)

### Connection

```typescript
// Connect to WebSocket
ws://api.teamforge.app/ws?token=<accessToken>
```

### Event Types

| Event | Payload | Description |
|-------|---------|-------------|
| `message.new` | Message | New message in chat |
| `message.updated` | Message | Message edited |
| `message.deleted` | { messageId } | Message deleted |
| `message.reaction` | Reaction | Reaction added/removed |
| `notification.new` | Notification | New notification |
| `group.updated` | Group | Group details changed |
| `plan.updated` | Plan | Plan details changed |
| `typing.start` | { chatId, userId } | User started typing |
| `typing.stop` | { chatId, userId } | User stopped typing |

---

*For product vision, see `product-vision.md`. For feature specifications, see `feature-specifications.md`.*
