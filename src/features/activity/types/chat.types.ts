import type { MessageStatus } from "./direct-chats.types";
export type { MessageStatus } from "./direct-chats.types";
import type { MessageType as GroupMessageType } from "./groups.types";
import type { DirectMessageType } from "./direct-chats.types";

export type UnifiedMessageType = DirectMessageType | GroupMessageType;

/**
 * UnifiedMessage - A shared structure for both DM and Group messages to
 * simplify rendering in a single component.
 */
export interface UnifiedMessage {
  id: string;
  type: UnifiedMessageType;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: string; // ISO datetime
  isOwn: boolean;
  status: MessageStatus;
  // Specific data for special message types
  readBy?: string[];
  chatId?: string; // groupId or participantId/chatId

  // Production-level features
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  reactions?: Record<string, UnifiedMessageReaction[]>;
  attachments?: UnifiedAttachment[];
  isEdited?: boolean;
  isPinned?: boolean;
  hasVoted?: boolean; // For PLAN_UPDATE messages
}

export interface UnifiedMessageReaction {
  userId: string;
  emoji: string;
}

export interface UnifiedAttachment {
  id: string;
  type: "image" | "file" | "voice";
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  duration?: number; // for voice notes
  waveform?: number[]; // for voice notes
}

/**
 * UnifiedParticipant - Represents a participant in a chat (DM or Group Member)
 */
export interface UnifiedParticipant {
  id: string;
  name: string;
  avatar: string;
}
