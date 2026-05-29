import type { GroupRole } from "@/shared/schemas/enums";

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
} from "@/features/activity/schemas/activity.schemas";
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

export type UnifiedParticipant =
  import("../schemas/activity.schemas").ActivityParticipant;
export type MemberRole = GroupRole;
export type FilterChip =
  | "all"
  | "groups"
  | "direct"
  | "unread"
  | "pinned"
  | "saved";

export interface ActivityOutgoingAttachment {
  file: File;
  duration?: number | null;
}

export interface ActivityOutgoingGifAttachment {
  height?: number | null;
  provider: "giphy";
  providerId: string;
  title: string;
  url: string;
  previewUrl?: string | null;
  width?: number | null;
}

export interface ActivitySendMessageInput {
  content: string;
  attachments?: ActivityOutgoingAttachment[];
  gif?: ActivityOutgoingGifAttachment;
}

export interface UnifiedConversation {
  id: string;
  kind: "dm" | "group";
  unreadCount: number;
  isTyping: boolean;
  isPinned?: boolean;
  savedMessageCount?: number;
  activeProposalCount?: number;
  latestSavedMessage?: import("../schemas/activity.schemas").UnifiedMessage;
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
