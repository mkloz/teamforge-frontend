import type {
  Message as SharedMessage,
  User as SharedUser,
  Attachment as SharedAttachment,
  Reaction as SharedReaction,
} from "@/shared/schemas";
import type { MessageStatus, MessageType } from "@/shared/schemas/enums";

/**
 * Unified Chat types for UI orchestration
 * These bridge the gap between canonical schemas and the shared UI components
 */

export type UnifiedMessage = SharedMessage & {
  // UI-specific extensions (computed properties)
  isOwn: boolean;
  hasVoted?: boolean;
  isSystem?: boolean;
};

export type UnifiedParticipant = SharedUser;

export type UnifiedAttachment = SharedAttachment;
export type UnifiedMessageReaction = SharedReaction;

export type { MessageStatus, MessageType };
