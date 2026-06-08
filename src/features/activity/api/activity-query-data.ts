import type {
  DirectChat,
  Group,
  UnifiedConversation,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

export interface ActivityFeedData {
  allItems: UnifiedConversation[];
  items: UnifiedConversation[];
  groupCount: number;
  dmCount: number;
  unreadCount: number;
  pinnedCount: number;
  allUnreadMessageCount: number;
  groupUnreadMessageCount: number;
  dmUnreadMessageCount: number;
  pinnedUnreadMessageCount: number;
  savedCount: number;
}

export interface ActivityGroupSelectionData {
  chatId: string | null;
  group: Group | null;
  proposalMessages: UnifiedMessage[];
  typingUsers: { name: string; avatar: string | null }[];
}

export interface ActivityDirectSelectionData {
  chat: DirectChat | null;
  chatId: string | null;
  isTyping: boolean;
}
