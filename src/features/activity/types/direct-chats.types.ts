/**
 * Direct Chats feature type definitions
 */

export type OnlineStatus = "ONLINE" | "AWAY" | "OFFLINE";

export type DirectMessageType = "TEXT" | "IMAGE" | "VOICE" | "SYSTEM";

export type MessageStatus = "SENDING" | "SENT" | "DELIVERED" | "READ";

/**
 * A user in a direct chat
 */
export interface Participant {
  id: string;
  name: string;
  avatar: string;
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
  // For voice messages
  duration?: number;
  // Reactions
  reactions?: {
    emoji: string;
    userId: string;
  }[];
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
