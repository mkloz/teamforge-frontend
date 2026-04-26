import type {
  Group as SharedGroup,
  Plan as SharedPlan,
  GroupMember as SharedGroupMember,
  Message as SharedMessage,
  Attachment as SharedAttachment,
  Reaction as SharedReaction,
} from "@/shared/schemas";
import type {
  PlanCategory,
  PlanStatus,
  GroupStatus,
  GroupRole,
  MessageType,
  MessageStatus,
} from "@/shared/schemas/enums";

/**
 * Groups feature type definitions
 * Re-exporting canonical types for convenience while maintaining feature-specific UI extensions
 */

export type {
  PlanCategory,
  PlanStatus,
  GroupStatus,
  GroupRole,
  MessageType,
  MessageStatus,
};

// Feature-specific aliases or extensions of canonical types
export type Group = SharedGroup & {
  planHistory?: PlanHistoryItem[];
};
export type Plan = SharedPlan;
export type GroupMember = SharedGroupMember;
export type Message = SharedMessage;
export type Attachment = SharedAttachment;
export type Reaction = SharedReaction;
export type MemberRole = GroupRole;

export interface PlanHistoryItem {
  id: string;
  title: string;
  category: PlanCategory;
  dateTime: string | null;
  coverImage: string | null;
  status: PlanStatus;
  location?: string;
  rating?: number;
}

/**
 * Lightweight Group preview for conversation lists
 * Denormalized for efficient rendering
 */
export interface GroupPreview {
  id: string;
  // Denormalized group data
  name: string;
  avatar: string | null;
  status: GroupStatus;

  // Denormalized plan data
  planTitle: string;
  planCategory: PlanCategory;
  planCoverImage: string;
  planDateTime: string;
  planStatus: PlanStatus;

  // Indicators
  pendingProposals?: number;
  memberCount: number;
  memberAvatars: string[]; // First 4 member avatars

  // Conversation data
  lastMessage?: {
    content: string;
    sender: {
      fullName: string;
      avatar: string | null;
    };
    createdAt: string;
    isSystem: boolean;
    type?: MessageType;
  };
  unreadCount: number;
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
