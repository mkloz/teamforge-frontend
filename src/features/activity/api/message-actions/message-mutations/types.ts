import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export interface MessageSelectionContext {
  kind: "group" | "dm";
  selectedId: string;
}

export interface UpdateMessageInChatInput {
  chatId: string;
  content: string;
  context: ActivityActionContext;
  messageId: string;
  selection: MessageSelectionContext;
}

export interface DeleteMessageInChatInput {
  chatId: string;
  context: ActivityActionContext;
  messageId: string;
  selection: MessageSelectionContext;
}

export interface ToggleReactionInChatInput {
  chatId: string;
  context: ActivityActionContext;
  emoji: string;
  message: UnifiedMessage;
  selection: MessageSelectionContext;
}

export interface ToggleSavedMessageInChatInput {
  chatId: string;
  context: ActivityActionContext;
  isSaved: boolean;
  message: UnifiedMessage;
  selection: MessageSelectionContext;
}

export interface ForwardMessageFromChatInput {
  message: UnifiedMessage;
  sourceChatId: string;
  targetChatId: string;
}
