import type {
  User,
  Message,
  Group,
  GroupMember,
  Plan,
  Chat,
  Attachment,
} from "@/shared/schemas";

/**
 * Creates a mock user with all required fields to satisfy the canonical User schema.
 */
export const createMockUser = (overrides: Partial<User>): User => ({
  id: "mock-id",
  email: "mock@example.com",
  fullName: "Mock User",
  avatar: null,
  bio: null,
  authProvider: "EMAIL",
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  age: 25,
  gender: "OTHER",
  city: "San Francisco",
  personalityType: "INFP",
  oceanO: 0.5,
  oceanC: 0.5,
  oceanE: 0.5,
  oceanA: 0.5,
  oceanN: 0.5,
  searchStatus: "IDLE",
  trustScore: 80,
  profileComplete: true,
  interests: [],
  ...overrides,
});

/**
 * Creates a mock attachment.
 */
export const createMockAttachment = (
  overrides: Partial<Attachment>,
): Attachment => ({
  id: "mock-att-id",
  type: "IMAGE",
  url: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1200&q=80",
  name: "attachment.jpg",
  size: 1024,
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
export const createMockMessage = (overrides: Partial<Message>): Message => ({
  id: "mock-msg-id",
  chatId: "mock-chat-id",
  senderId: "mock-user-id",
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
    id: overrides.senderId || "mock-user-id",
    fullName: "Mock Sender",
  }),
  ...overrides,
});

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
  compatibilityScore: 80,
  user: createMockUser({ id: overrides.userId || "mock-user-id" }),
  ...overrides,
});

/**
 * Creates a mock plan with all required fields.
 */
export const createMockPlan = (overrides: Partial<Plan>): Plan => ({
  id: "mock-plan-id",
  groupId: "mock-group-id",
  title: "Mock Plan",
  description: "Mock Description",
  category: "OTHER",
  coverImage: null,
  dateTime: new Date().toISOString(),
  location: "Mock Location",
  locationMode: "IN_PERSON",
  locationLat: null,
  locationLng: null,
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
  description: "Mock Description",
  avatar: null,
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
export const createMockChat = (overrides: Partial<Chat>): Chat => ({
  id: "mock-chat-id",
  type: "PRIVATE",
  createdAt: new Date().toISOString(),
  groupId: null,
  participants: [],
  messages: [],
  pinnedMessages: [],
  ...overrides,
});
