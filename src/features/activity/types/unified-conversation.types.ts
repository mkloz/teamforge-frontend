import type { OnlineStatus, MessageStatus } from "@/features/direct-chats/types/direct-chats.types";
import type { PlanStatus, GroupStatus } from "@/features/groups/types/groups.types";

export type ConversationKind = "group" | "dm";

export type FilterChip = "all" | "groups" | "dms" | "unread";

export interface UnifiedConversation {
  id: string;
  kind: ConversationKind;

  // Common display fields
  title: string;
  subtitle: string; // last message preview or typing indicator text
  avatarUrl: string;
  timestamp: string; // ISO — used for recency sort
  unreadCount: number;

  // Last message metadata
  lastMessageIsOwn?: boolean;
  lastMessageStatus?: MessageStatus;
  lastMessageIsSystem?: boolean;

  // DM-only
  onlineStatus?: OnlineStatus;
  isTyping?: boolean;
  isMuted?: boolean;

  // Group-only
  memberCount?: number;
  memberAvatars?: string[];
  planCoverImage?: string;
  planDateTime?: string;
  planStatus?: PlanStatus;
  groupStatus?: GroupStatus;
  pendingProposals?: number;
  senderName?: string; // last message sender for groups
}
