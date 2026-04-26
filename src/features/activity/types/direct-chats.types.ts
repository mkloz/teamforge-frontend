import type {
  Chat as SharedChat,
  Message as SharedMessage,
  User as SharedUser,
} from "@/shared/schemas";
import type {
  MessageStatus,
  MessageType,
  ChatType,
} from "@/shared/schemas/enums";

/**
 * Direct Chats feature type definitions
 * Re-exporting canonical types for convenience
 */

export type { MessageStatus, MessageType, ChatType };
export type OnlineStatus = "ONLINE" | "AWAY" | "OFFLINE";

export type DirectChat = SharedChat;
export type Participant = SharedUser;
export type DirectMessage = SharedMessage;

/**
 * Preview for direct chat list
 */
export interface DirectChatPreview {
  id: string;
  participantId: string;
  participantFullName: string;
  participantAvatar: string | null;
  onlineStatus?: "ONLINE" | "AWAY" | "OFFLINE";
  lastSeen?: string;
  // Conversation data
  lastMessage?: {
    content: string;
    createdAt: string;
    isOwn: boolean;
    status: MessageStatus;
    type?: MessageType;
  };
  unreadCount: number;
  // Real-time indicators
  isTyping: boolean;
  isMuted: boolean;
}

/**
 * State for direct chats feature
 */
export interface DirectChatsState {
  selectedChatId: string | null;
  isProfilePanelOpen: boolean;
  searchQuery: string;
  draftMessages: Record<string, string>;
}
