import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  getMessageInteractionAriaLabel,
  getMessageInteractionState,
  type MessageInteractionReactionGroup,
} from "../message-interaction-state";

interface GetMessageItemViewStateInput {
  editingMessageId: string | null;
  isContextMenuOpen: boolean;
  isHighlighted: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
  message: UnifiedMessage;
  reactionGroups: MessageInteractionReactionGroup[];
  replyingToId: string | null;
  savedMessageIds: ReadonlySet<string>;
}

export function getMessageItemViewState({
  editingMessageId,
  isContextMenuOpen,
  isHighlighted,
  isSelectable,
  isSelected,
  isSelectionMode,
  message,
  reactionGroups,
  replyingToId,
  savedMessageIds,
}: GetMessageItemViewStateInput) {
  const interactionState = getMessageInteractionState({
    editingMessageId,
    isContextMenuOpen,
    isHighlighted,
    isMessageSaved: message.isSaved,
    isSelectable,
    isSelectionMode,
    messageId: message.id,
    reactionGroups,
    replyingToId,
    savedMessageIds,
  });
  const messageAriaLabel = getMessageInteractionAriaLabel({
    createdAt: message.createdAt,
    isSelected,
    isSelectionMode,
    messageKind: "message",
    selectionPlacement: "afterTimestamp",
    senderLabel: getMessageSenderLabel(message),
  });

  return {
    ...interactionState,
    messageAriaLabel,
    usesInlineFooter: shouldUseInlineFooter(message, reactionGroups),
  };
}

export function isMessageSelectionKey(key: string) {
  return key === "Enter" || key === " ";
}

function shouldUseInlineFooter(
  message: UnifiedMessage,
  reactionGroups: MessageInteractionReactionGroup[],
) {
  return (
    message.content.trim().length > 0 &&
    !message.replyTo &&
    message.content.length < 50 &&
    !message.content.includes(" ") &&
    reactionGroups.length === 0
  );
}

function getMessageSenderLabel(message: UnifiedMessage) {
  return message.isOwn ? "You" : (message.sender?.name ?? "Unknown");
}
