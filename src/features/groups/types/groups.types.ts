/**
 * Groups feature type definitions
 * Based on the unified Group-Plan architecture
 */

export type PlanCategory =
  | "Tech"
  | "Sports"
  | "Arts"
  | "Social"
  | "Outdoors"
  | "Learning"
  | "Music"
  | "Food"
  | "Gaming"
  | "Wellness";

export type PlanStatus = "DRAFT" | "CONFIRMED" | "COMPLETED";

export type GroupStatus = "FORMING" | "PENDING" | "ACTIVE" | "COMPLETED" | "DISSOLVED";

export type MemberRole = "ADMIN" | "MEMBER";

export type MessageType = "TEXT" | "IMAGE" | "LOCATION" | "SYSTEM" | "PLAN_UPDATE";

/**
 * The Plan embedded within a Group
 * Represents what the group will do together
 */
export interface Plan {
  title: string;
  description: string;
  category: PlanCategory;
  coverImage: string;
  dateTime: string; // ISO datetime
  location: string;
  locationCoords?: {
    lat: number;
    lng: number;
  };
  status: PlanStatus;
}

/**
 * A member within a group
 */
export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  personalityType: string;
  trustScore: number; // 0-1
  role: MemberRole;
  compatibilityScore: number; // 0-100, compared to current user
  joinedAt: string; // ISO datetime
}

/**
 * Full Group entity with embedded Plan
 */
export interface Group {
  id: string;
  plan: Plan;
  members: GroupMember[];
  status: GroupStatus;
  createdAt: string; // ISO datetime
  createdBy: string; // User ID of the creator
  maxMembers: number;
}

/**
 * Lightweight Group preview for conversation lists
 * Denormalized for efficient rendering
 */
export interface GroupPreview {
  id: string;
  // Plan data (denormalized)
  planTitle: string;
  planCategory: PlanCategory;
  planCoverImage: string;
  planDateTime: string;
  planStatus: PlanStatus;
  // Group data
  status: GroupStatus;
  memberCount: number;
  memberAvatars: string[]; // First 4 member avatars
  // Conversation data
  lastMessage?: {
    content: string;
    senderName: string;
    timestamp: string;
    isSystem: boolean;
  };
  unreadCount: number;
}

/**
 * A single message in a group conversation
 */
export interface Message {
  id: string;
  groupId: string;
  type: MessageType;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: string; // ISO datetime
  isOwn: boolean; // Whether current user sent this
  readBy?: string[]; // User IDs who have read this message
}

/**
 * System message events
 */
export type SystemMessageEvent =
  | "MEMBER_JOINED"
  | "MEMBER_LEFT"
  | "PLAN_CONFIRMED"
  | "PLAN_UPDATED"
  | "GROUP_COMPLETED";

/**
 * Template for creating a new group
 */
export interface PlanTemplate {
  id: string;
  title: string;
  description: string;
  category: PlanCategory;
  icon: string;
  backgroundImage: string;
  suggestedTags: string[];
}

/**
 * State for the groups page
 */
export interface GroupsPageState {
  selectedGroupId: string | null;
  isDetailPanelOpen: boolean;
  searchQuery: string;
  draftMessages: Record<string, string>;
}
