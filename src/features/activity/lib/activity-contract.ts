import type { GroupRole } from "@/shared/schemas/enums";

export type {
  ActivityAccess,
  ActivityStatus,
  ActivityVisibility,
  ChatType,
  CostType,
  ForgeMode,
  GroupRole,
  GroupStatus,
  LocationMode,
  MessageStatus,
  MessageType,
  OnlineStatus,
  PlanCategory,
  PlanStatus,
} from "@/shared/schemas/enums";
export type { PlanProposal } from "@/shared/schemas/plan";
export type {
  ActivityChatParticipant,
  ActivityMutualGroup,
  ActivityParticipant,
  DirectChat,
  Group,
  GroupMember,
  Plan,
  PlanHistoryItem,
  UnifiedAttachment,
  UnifiedMessage,
  UnifiedReaction as UnifiedMessageReaction,
} from "../schemas/activity.schemas";

export type UnifiedParticipant =
  import("../schemas/activity.schemas").ActivityParticipant;
export type MemberRole = GroupRole;
export type FilterChip = "all" | "groups" | "direct" | "unread";

export interface ActivityOutgoingAttachment {
  file: File;
  duration?: number | null;
}

export interface ActivitySendMessageInput {
  content: string;
  attachments?: ActivityOutgoingAttachment[];
}

export interface UnifiedConversation {
  id: string;
  kind: "dm" | "group";
  unreadCount: number;
  isTyping: boolean;
  latestMessage?: import("../schemas/activity.schemas").UnifiedMessage;
  group?: import("../schemas/activity.schemas").Group;
  chat?: import("../schemas/activity.schemas").DirectChat;
}

export interface GroupsPageState {
  selectedGroupId: string | null;
  isDetailPanelOpen: boolean;
  searchQuery: string;
  draftMessages: Record<string, string>;
}

export interface DirectChatsState {
  selectedChatId: string | null;
  isProfilePanelOpen: boolean;
  searchQuery: string;
  draftMessages: Record<string, string>;
}
