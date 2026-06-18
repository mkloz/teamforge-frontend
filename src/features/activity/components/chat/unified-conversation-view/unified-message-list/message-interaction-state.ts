import { formatChatTime } from "@/features/activity/lib/chat-utils";
import type { ReactionGroup } from "./unified-message-item/message-reactions";

export type MessageInteractionReactionGroup = ReactionGroup;

interface GetMessageInteractionStateInput {
  editingMessageId: string | null;
  isContextMenuOpen: boolean;
  isHighlighted: boolean;
  isMessageSaved?: boolean;
  isSelectable: boolean;
  isSelectionMode: boolean;
  messageId: string;
  reactionGroups: MessageInteractionReactionGroup[];
  replyingToId: string | null;
  savedMessageIds: ReadonlySet<string>;
}

interface GetMessageInteractionAriaLabelInput {
  createdAt: string;
  isSelected: boolean;
  isSelectionMode: boolean;
  messageKind: "message" | "proposal message";
  selectionPlacement: "afterTimestamp" | "beforeSender";
  senderLabel: string;
}

export function getMessageInteractionState({
  editingMessageId,
  isContextMenuOpen,
  isHighlighted,
  isMessageSaved,
  isSelectable,
  isSelectionMode,
  messageId,
  reactionGroups,
  replyingToId,
  savedMessageIds,
}: GetMessageInteractionStateInput) {
  const isReplyTarget = replyingToId === messageId;
  const isEditTarget = editingMessageId === messageId;
  const isInteractionFocused =
    isReplyTarget || isEditTarget || isContextMenuOpen;

  return {
    canToggleSelection: isSelectionMode && isSelectable,
    isInteractionFocused,
    isSaved: Boolean(isMessageSaved) || savedMessageIds.has(messageId),
    selectedReactionEmojis: reactionGroups
      .filter((reaction) => reaction.isActive)
      .map((reaction) => reaction.emoji),
    shouldShowOuterFocus: isHighlighted || isInteractionFocused,
  };
}

export function getMessageInteractionAriaLabel({
  createdAt,
  isSelected,
  isSelectionMode,
  messageKind,
  selectionPlacement,
  senderLabel,
}: GetMessageInteractionAriaLabelInput) {
  const selectionLabel = isSelectionMode
    ? isSelected
      ? "Selected. "
      : "Not selected. "
    : "";
  const timestamp = formatChatTime(createdAt);

  if (selectionPlacement === "beforeSender") {
    return `${selectionLabel}${senderLabel} ${messageKind} at ${timestamp}. Press Shift and F10 for message actions.`;
  }

  return `${senderLabel} ${messageKind} at ${timestamp}. ${selectionLabel}Press Shift and F10 for message actions.`;
}
