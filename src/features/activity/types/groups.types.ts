import type { UnifiedAttachment, UnifiedMessageReaction } from "./chat.types";
import type { MessageStatus } from "./direct-chats.types";

/**
 * Groups feature type definitions
 * Based on the unified Group-Plan architecture with separate identity
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

export type GroupStatus =
  | "FORMING"
  | "PENDING"
  | "ACTIVE"
  | "COMPLETED"
  | "DISSOLVED";

export type MemberRole = "ADMIN" | "MEMBER";

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "VOICE"
  | "LOCATION"
  | "SYSTEM"
  | "PLAN_UPDATE";

/**
 * The persistent Group identity (separate from the Plan)
 * This stays constant even as plans change
 */
export interface GroupIdentity {
  name: string;
  avatar: string; // Group's chosen avatar/icon
  description?: string;
  createdAt: string;
}

/**
 * A proposal to modify a plan field
 */
export interface PlanProposal {
  id: string;
  field: "title" | "description" | "dateTime" | "location";
  currentValue: string;
  proposedValue: string;
  proposedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  votes: {
    approve: string[]; // User IDs
    reject: string[];
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
}

/**
 * A comment on a plan element
 */
export interface PlanComment {
  id: string;
  field?: "title" | "description" | "dateTime" | "location" | "general";
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  reactions?: {
    emoji: string;
    userIds: string[];
  }[];
}

/**
 * A completed plan in history
 */
export interface PlanHistoryItem {
  id: string;
  title: string;
  category: PlanCategory;
  coverImage: string;
  dateTime: string;
  location: string;
  completedAt: string;
  rating?: number; // 1-5
  memberCount: number;
}

/**
 * The Plan embedded within a Group
 * Represents what the group will do together
 */
export interface Plan {
  id: string;
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
  // Collaboration features
  proposals?: PlanProposal[];
  comments?: PlanComment[];
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
  // Persistent group identity (separate from plan)
  identity: GroupIdentity;
  // Current plan
  plan: Plan;
  // Past plans (for reusability)
  planHistory?: PlanHistoryItem[];
  members: GroupMember[];
  status: GroupStatus;
  createdAt: string; // ISO datetime
  createdBy: string; // User ID of the creator
  maxMembers: number;
  pinnedMessages?: import("./chat.types").UnifiedMessage[];
}

/**
 * Lightweight Group preview for conversation lists
 * Denormalized for efficient rendering
 */
export interface GroupPreview {
  id: string;
  // Group identity (denormalized)
  groupName: string;
  groupAvatar: string;
  // Plan data (denormalized)
  planTitle: string;
  planCategory: PlanCategory;
  planCoverImage: string;
  planDateTime: string;
  planStatus: PlanStatus;
  // Proposal indicator
  pendingProposals?: number;
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
    type?: MessageType;
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
  status?: MessageStatus;
  readBy?: string[]; // User IDs who have read this message
  isEdited?: boolean;
  isPinned?: boolean;
  hasVoted?: boolean; // For PLAN_UPDATE messages
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  attachments?: UnifiedAttachment[];
  reactions?: Record<string, UnifiedMessageReaction[]>;
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
