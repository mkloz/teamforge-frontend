import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  canReactToMessage,
  isOptimisticMessageId,
  isSyntheticProposalMessageId,
} from "@/features/activity/lib/message-action-capabilities";
import type { MessageSelectionContext } from "./types";

export function getMessageUpdateSelection(
  kind: "group" | "dm" | null,
  selectedId: string | null,
  messageId: string,
): MessageSelectionContext | null {
  const selection = getSelectedMessageContext(kind, selectedId);

  if (
    !selection ||
    isSyntheticProposalMessageId(messageId) ||
    isOptimisticMessageId(messageId)
  ) {
    return null;
  }

  return selection;
}

export function getMessageDeleteSelection(
  kind: "group" | "dm" | null,
  selectedId: string | null,
  messageId: string,
): MessageSelectionContext | null {
  return getExistingMessageSelection(kind, selectedId, messageId);
}

export function getExistingMessageSelection(
  kind: "group" | "dm" | null,
  selectedId: string | null,
  messageId: string,
): MessageSelectionContext | null {
  const selection = getSelectedMessageContext(kind, selectedId);

  if (!selection || isSyntheticProposalMessageId(messageId)) {
    return null;
  }

  return selection;
}

export function getMessageReactionSelection(
  kind: "group" | "dm" | null,
  selectedId: string | null,
  message: UnifiedMessage,
): MessageSelectionContext | null {
  const selection = getSelectedMessageContext(kind, selectedId);

  if (!selection || !canReactToMessage(message)) {
    return null;
  }

  return selection;
}

export function resolveSelectedChatId(
  context: ActivityActionContext,
  selection: MessageSelectionContext,
) {
  return context.resolveChatId(selection.kind, selection.selectedId);
}

function getSelectedMessageContext(
  kind: "group" | "dm" | null,
  selectedId: string | null,
): MessageSelectionContext | null {
  if (!kind || !selectedId) {
    return null;
  }

  return { kind, selectedId };
}
