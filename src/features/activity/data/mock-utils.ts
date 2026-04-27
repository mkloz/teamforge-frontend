import type {
  User,
  Message,
  GroupMember,
  Plan,
  Attachment,
} from "@/shared/schemas";
import type { Group } from "../types/groups.types";
import type { DirectChat as ChatFeature } from "../types/direct-chats.types";

/**
 * High-quality Unsplash image generator
 */
export const getUnsplashImage = (id: string, width = 800, height = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&h=${height}&fit=crop&q=80`;

export const MOCK_AVATARS = {
  jordan: "1438753862140-7a6c1fb7c2c9",
  sam: "1500648767791-00dcc994a43e",
  casey: "1494790108377-be9c29b29330",
  taylor: "1507003211169-0a1dd7228f2d",
  alex: "1539571696357-5a69c17a67c6",
  designer: "1573496359142-d8d83331f586",
  robot: "1531297484001-80022131f5a1",
  nature: "1464822759023-fed622ff2c3b",
  hiker: "1551632432-c735e7a93522",
  city: "1449156003053-c3c8cf09bcdd",
  professional: "1560250097-0b93528c311a",
  creative: "1534528741775-53994a69daeb",
};

/**
 * Dicebear avatar generator for consistency with Home page
 */
export const getDicebearAvatar = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`;

/**
 * Creates a mock user with all required fields to satisfy the canonical User schema.
 */
export const createMockUser = (overrides: Partial<User>): User => {
  const id = overrides.id || `u-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    email: `${id}@example.com`,
    fullName: overrides.fullName || "Mock User",
    avatar: getDicebearAvatar(id),
    bio: "Passionate about building community and exploring new places.",
    authProvider: "EMAIL",
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    age: 24,
    gender: "OTHER",
    city: "San Francisco",
    personalityType: "INFP",
    oceanO: 0.7,
    oceanC: 0.6,
    oceanE: 0.4,
    oceanA: 0.8,
    oceanN: 0.3,
    searchStatus: "IDLE",
    trustScore: 85,
    profileComplete: true,
    interests: [
      {
        id: "i1",
        label: "Hiking",
        slug: "hiking",
        description: null,
        icon: "mountain",
        color: "#0D9488",
        sortOrder: 0,
        isActive: true,
        parentId: null,
        aliases: [],
      },
      {
        id: "i2",
        label: "Design",
        slug: "design",
        description: null,
        icon: "palette",
        color: "#0D9488",
        sortOrder: 1,
        isActive: true,
        parentId: null,
        aliases: [],
      },
    ],
    ...overrides,
  };
};

/**
 * Creates a mock attachment.
 */
export const createMockAttachment = (
  overrides: Partial<Attachment>,
): Attachment => ({
  id: `att-${Math.random().toString(36).substr(2, 9)}`,
  type: "IMAGE",
  url: getUnsplashImage("1511367461989-f85a21fda167"),
  name: "attachment.jpg",
  size: 1024 * 500, // 500KB
  mimeType: "image/jpeg",
  thumbnailUrl: null,
  duration: null,
  waveform: [],
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates a mock message with all required fields to satisfy the canonical Message schema.
 */
export const createMockMessage = (overrides: Partial<Message>): Message => {
  const senderId = overrides.senderId || "u-marcus";
  const senderName =
    senderId === "system"
      ? "System"
      : senderId === "user-current" || senderId === "current-user"
        ? "Alex (You)"
        : "Marcus Thorne";

  return {
    id: `msg-${Math.random().toString(36).substr(2, 9)}`,
    chatId: "mock-chat-id",
    senderId,
    content: "Mock content",
    type: "TEXT",
    status: "SENT",
    createdAt: new Date().toISOString(),
    isEdited: false,
    isPinned: false,
    editedAt: null,
    deletedAt: null,
    replyToId: null,
    pinnedInChatId: null,
    attachments: [],
    reactions: [],
    sender: createMockUser({
      id: senderId,
      fullName: senderName,
      avatar: senderId === "system" ? null : getDicebearAvatar(senderId),
    }),
    ...overrides,
  };
};

/**
 * Creates a mock group member with all required fields.
 */
export const createMockGroupMember = (
  overrides: Partial<GroupMember>,
): GroupMember => ({
  userId: "mock-user-id",
  groupId: "mock-group-id",
  role: "MEMBER",
  joinedAt: new Date().toISOString(),
  leftAt: null,
  compatibilityScore: 85,
  user: createMockUser({ id: overrides.userId || "mock-user-id" }),
  ...overrides,
});

/**
 * Creates a mock plan with all required fields.
 */
export const createMockPlan = (overrides: Partial<Plan>): Plan => ({
  id: `plan-${Math.random().toString(36).substr(2, 9)}`,
  groupId: "mock-group-id",
  title: "Mock Plan",
  description: "Join us for an amazing afternoon of exploration and fun!",
  category: "OTHER",
  coverImage: getUnsplashImage("1506905925346-21bda4d32df4"),
  dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  location: "Mock Location",
  locationMode: "IN_PERSON",
  locationLat: 37.7749,
  locationLng: -122.4194,
  cost: "FREE",
  costAmount: null,
  costDetails: null,
  status: "DRAFT",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completedAt: null,
  cancelledAt: null,
  proposals: [],
  comments: [],
  ...overrides,
});

/**
 * Creates a mock group with all required fields.
 */
export const createMockGroup = (overrides: Partial<Group>): Group => ({
  id: "mock-group-id",
  name: "Mock Group",
  description:
    "A community of people who love discovering new things together.",
  avatar: getUnsplashImage("1522202176988-66273c2fd55f", 200, 200),
  status: "ACTIVE",
  maxMembers: 10,
  activityId: "mock-activity-id",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  disbandedAt: null,
  members: [],
  plan: createMockPlan({ groupId: overrides.id || "mock-group-id" }),
  ...overrides,
});

/**
 * Creates a mock chat with all required fields.
 */
export const createMockChat = (
  overrides: Partial<ChatFeature>,
): ChatFeature => ({
  id: "mock-chat-id",
  type: "PRIVATE",
  createdAt: new Date().toISOString(),
  groupId: null,
  participants: [],
  messages: [],
  pinnedMessages: [],
  isMuted: false,
  isBlocked: false,
  ...overrides,
});
