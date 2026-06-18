import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { canReactToMessage } from "@/features/activity/lib/message-action-capabilities";
import {
  getMessageInteractionAriaLabel,
  getMessageInteractionState,
  type MessageInteractionReactionGroup,
} from "../message-interaction-state";

interface GetProposalMessageInteractionStateInput {
  editingMessageId: string | null;
  isContextMenuOpen: boolean;
  isHighlighted: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
  message: UnifiedMessage;
  proposalProposerName: string;
  reactionGroups: MessageInteractionReactionGroup[];
  replyingToId: string | null;
  savedMessageIds: ReadonlySet<string>;
}

export function getProposalMessageInteractionState({
  editingMessageId,
  isContextMenuOpen,
  isHighlighted,
  isSelectable,
  isSelected,
  isSelectionMode,
  message,
  proposalProposerName,
  reactionGroups,
  replyingToId,
  savedMessageIds,
}: GetProposalMessageInteractionStateInput) {
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
  const senderLabel = message.isOwn
    ? "You"
    : (message.sender?.name ?? proposalProposerName);
  const messageAriaLabel = getMessageInteractionAriaLabel({
    createdAt: message.createdAt,
    isSelected,
    isSelectionMode,
    messageKind: "proposal message",
    selectionPlacement: "beforeSender",
    senderLabel,
  });

  return {
    ...interactionState,
    canShowQuickReactions: !message.isOwn && canReactToMessage(message),
    messageAriaLabel,
  };
}
