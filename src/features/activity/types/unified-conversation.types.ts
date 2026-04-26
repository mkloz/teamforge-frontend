import type { Group, Chat } from "@/shared/schemas";
import type { MessageType, MessageStatus } from "@/shared/schemas/enums";

/**
 * Filter options for the unified activity feed
 */
export type FilterChip = "all" | "groups" | "direct" | "unread";

/**
 * UnifiedConversation - A shared type for both DM and Group previews in the activity feed.
 * It is a union of Group and Chat canonical types with UI-specific extensions.
 */
export interface UnifiedConversation {
  id: string;
  kind: "dm" | "group";

  // Display properties (derived from canonical data)
  title: string;
  subtitle?: string;
  avatarUrl: string | null;
  secondaryAvatar?: string; // e.g. plan cover image or inviter

  // Status indicators
  onlineStatus?: "ONLINE" | "AWAY" | "OFFLINE";
  unreadCount: number;
  isMuted: boolean;
  isTyping: boolean;

  // Last message metadata (Standardized to canonical patterns)
  lastMessage?: {
    content: string;
    sender: {
      fullName: string;
      avatar: string | null;
    };
    createdAt: string;
    isSystem: boolean;
    isOwn?: boolean;
    status?: MessageStatus;
    type?: MessageType;
  };

  // Feature-specific metadata for UI
  planDateTime?: string;
  planStatus?: string;
  pendingProposals?: number;

  // Links to raw canonical data
  rawGroup?: Group;
  rawChat?: Chat;
}

export type ConversationFilter = FilterChip;
