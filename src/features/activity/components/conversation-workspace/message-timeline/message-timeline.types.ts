import type { RefObject } from "react";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type { MessageTimelineKind } from "./message-renderer-props";
import type { MessageScrollHandle } from "./message-scroll.types";

export interface MessageTimelineProps {
  messages: UnifiedMessage[];
  searchQuery?: string;
  kind: MessageTimelineKind;
  conversationId: string;
  emptyStateVariant?: "default" | "my-notes";
  focusedMessageId?: string | null;
  firstUnreadMessageId?: string | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  containerRef?: RefObject<HTMLDivElement | null>;
  messageScrollHandleRef?: RefObject<MessageScrollHandle | null>;
  onLoadOlderMessages?: () => Promise<void> | void;
  onRetryInitialError?: () => Promise<void> | void;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  selectionState?: MessageTimelineSelectionState;
  status?: MessageTimelineStatus;
  typingUsers?: { name: string; avatar: string | null }[];
}

export interface MessageTimelineSelectionState {
  isSelectionMode?: boolean;
  selectedMessageIds?: ReadonlySet<string>;
}

export interface MessageTimelineStatus {
  hasOlderMessages?: boolean;
  isInitialError?: boolean;
  isInitialLoading?: boolean;
  isLoadingOlderMessages?: boolean;
  isOffline?: boolean;
}

export type MessageTimelineTypingUsers = NonNullable<
  MessageTimelineProps["typingUsers"]
>;
