import type { UnifiedAttachment, UnifiedMessageReaction } from "./chat.types";

/**
 * Direct Chats feature type definitions
 */

export type OnlineStatus = "ONLINE" | "AWAY" | "OFFLINE";

export type DirectMessageType = "TEXT" | "IMAGE" | "VOICE" | "SYSTEM";

export type MessageStatus =
  | "SENDING"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED";

/**
 * A user in a direct chat
 */
export interface Participant {
  id: string;
  name: string;
  avatar: string;
  age?: number;
  location?: string;
  bio?: string;
  personalityType?: string;
  onlineStatus: OnlineStatus;
  lastSeen?: string; // ISO datetime
}

/**
 * A direct chat conversation
 */
export interface DirectChat {
  id: string;
  participant: Participant;
  createdAt: string;
  // Mutual connections
  mutualGroups?: {
    id: string;
    name: string;
    avatar: string;
  }[];
  // Settings
  isMuted: boolean;
  isBlocked: boolean;
  pinnedMessages?: import("./chat.types").UnifiedMessage[];
}

/**
 * Preview for direct chat list
 */
export interface DirectChatPreview {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  onlineStatus: OnlineStatus;
  lastSeen?: string;
  // Conversation data
  lastMessage?: {
    content: string;
    timestamp: string;
    isOwn: boolean;
    status: MessageStatus;
    type?: DirectMessageType;
  };
  unreadCount: number;
  // Real-time indicators
  isTyping: boolean;
  isMuted: boolean;
}

/**
 * A message in a direct chat
 */
export interface DirectMessage {
  id: string;
  chatId: string;
  type: DirectMessageType;
  content: string;
  senderId: string;
  timestamp: string;
  isOwn: boolean;
  status: MessageStatus;
  // Production-level features
  isEdited?: boolean;
  isPinned?: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  attachments?: UnifiedAttachment[];
  reactions?: Record<string, UnifiedMessageReaction[]>;
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
