import type { RefObject } from "react";
import type { MessageScrollHandle } from "@/features/activity/components/conversation-workspace/message-timeline/message-scroll.types";
import type {
  ActivityParticipant,
  ActivitySendMessageInput,
  DirectChat,
  Group,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

export type ConversationWorkspaceProps =
  | (BaseConversationProps & { kind: "dm"; data: DirectChat })
  | (BaseConversationProps & { kind: "group"; data: Group });

interface BaseConversationProps {
  messages: UnifiedMessage[];
  hasOlderMessages?: boolean;
  isTyping?: boolean;
  firstUnreadMessageId?: string | null;
  isLoadingOlderMessages?: boolean;
  isMessageError?: boolean;
  isOnline?: boolean;
  typingUsers?: { name: string; avatar: string | null }[];
  isActionOpen?: boolean;
  openHeaderDetailsInPanel?: boolean;
  focusedMessageId?: string | null;
  isLoadingMessages?: boolean;
  messageScrollHandleRef?: RefObject<MessageScrollHandle | null>;
  sendError?: string | null;
  onBack: () => void;
  onClearSendError?: () => void;
  onLoadOlderMessages?: () => Promise<void> | void;
  onRetryMessages?: () => Promise<void> | void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  onToggleAction: () => void;
  onViewPlan?: () => void;
  onSendMessage: (input: ActivitySendMessageInput) => Promise<void> | void;
}

export interface ConversationSearchState {
  conversationId: string | null;
  query: string;
}
