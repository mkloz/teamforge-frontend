import { useState } from "react";

import { createMessageItemInteractionHandlers } from "@/features/activity/components/conversation-workspace/message-timeline/message-item/message-item-interactions";
import { getProposalMessageInteractionState } from "@/features/activity/components/conversation-workspace/message-timeline/proposal-message/proposal-message-interaction-state";
import {
  type AvailableProposalMessageRuntimeState,
  hasProposalMessageViewState,
  type ProposalMessageRuntimeState,
  useProposalMessageRuntime,
} from "@/features/activity/components/conversation-workspace/message-timeline/proposal-message/proposal-message-runtime";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

interface UseProposalMessageControllerInput {
  isHighlighted: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
  message: UnifiedMessage;
  onToggleSelected?: (message: UnifiedMessage) => void;
}

type AvailableProposalMessageViewState = NonNullable<
  AvailableProposalMessageRuntimeState["viewState"]
>;
type ProposalMessageActions = ProposalMessageRuntimeState["messageActions"];
type ProposalPlanActions = ProposalMessageRuntimeState["proposalActions"];
type ProposalMessageInteractionState = ReturnType<
  typeof getProposalMessageInteractionState
>;
type ProposalMessageLayoutState = Pick<
  ProposalMessageRuntimeState,
  "isReadByOthers" | "reactionGroups"
>;
type ProposalMessageSwipeState = ProposalMessageRuntimeState["swipeState"];
type ProposalMessageInteractionHandlers = ReturnType<
  typeof createMessageItemInteractionHandlers
>;

interface MissingProposalMessageController {
  isAvailable: false;
  viewState: null;
}

interface AvailableProposalMessageController {
  articleState: Pick<
    ProposalMessageInteractionState,
    "canToggleSelection" | "messageAriaLabel" | "shouldShowOuterFocus"
  > &
    Pick<
      ProposalMessageInteractionHandlers,
      "handleMessageClick" | "handleMessageKeyDown"
    >;
  bubbleState: Pick<
    ProposalMessageInteractionState,
    "canShowQuickReactions" | "isInteractionFocused" | "isSaved"
  >;
  contextMenuState: Pick<
    ProposalMessageInteractionState,
    "isSaved" | "selectedReactionEmojis"
  >;
  isAvailable: true;
  isExpanded: boolean;
  layoutState: Pick<
    ProposalMessageLayoutState,
    "isReadByOthers" | "reactionGroups"
  >;
  messageActions: ProposalMessageActions;
  proposalActions: ProposalPlanActions;
  setIsContextMenuOpen: (open: boolean) => void;
  swipeState: ProposalMessageSwipeState;
  toggleExpanded: () => void;
  toggleReaction: ProposalMessageInteractionHandlers["handleToggleReaction"];
  viewState: AvailableProposalMessageViewState;
}

export type ProposalMessageController =
  | AvailableProposalMessageController
  | MissingProposalMessageController;

export type AvailableProposalMessageControllerState =
  AvailableProposalMessageController;

interface ProposalMessageControllerBuilderInput {
  interactionHandlers: ProposalMessageInteractionHandlers;
  interactionState: ProposalMessageInteractionState;
  isExpanded: boolean;
  runtime: AvailableProposalMessageRuntimeState;
  setIsContextMenuOpen: (open: boolean) => void;
  toggleExpanded: () => void;
}

export function useProposalMessageController(
  input: UseProposalMessageControllerInput,
): ProposalMessageController {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const runtime = useProposalMessageRuntime(input.message);

  if (!hasProposalMessageViewState(runtime)) {
    return getMissingProposalMessageController();
  }

  const interactionState = getControllerInteractionState({
    input,
    isContextMenuOpen,
    runtime,
  });
  const interactionHandlers = getControllerInteractionHandlers({
    input,
    interactionState,
    messageActions: runtime.messageActions,
  });

  return buildAvailableProposalMessageController({
    interactionHandlers,
    interactionState,
    isExpanded,
    runtime,
    setIsContextMenuOpen,
    toggleExpanded: () => setIsExpanded((value) => !value),
  });
}

function getMissingProposalMessageController(): MissingProposalMessageController {
  return {
    isAvailable: false,
    viewState: null,
  };
}

function getControllerInteractionState({
  input,
  isContextMenuOpen,
  runtime,
}: {
  input: UseProposalMessageControllerInput;
  isContextMenuOpen: boolean;
  runtime: AvailableProposalMessageRuntimeState;
}): ProposalMessageInteractionState {
  return getProposalMessageInteractionState({
    editingMessageId: getEditingMessageId(runtime.messageActions),
    isContextMenuOpen,
    isHighlighted: input.isHighlighted,
    isSelectable: input.isSelectable,
    isSelected: input.isSelected,
    isSelectionMode: input.isSelectionMode,
    message: input.message,
    proposalProposerName: getProposalProposerName(runtime),
    reactionGroups: runtime.reactionGroups,
    replyingToId: getReplyingToId(runtime.messageActions),
    savedMessageIds: runtime.savedMessageIds,
  });
}

function getEditingMessageId(messageActions: ProposalMessageActions) {
  return messageActions.editingMessage?.id ?? null;
}

function getReplyingToId(messageActions: ProposalMessageActions) {
  return messageActions.replyingTo?.id ?? null;
}

function getProposalProposerName(
  runtime: AvailableProposalMessageRuntimeState,
) {
  return runtime.viewState.proposal.proposer.name;
}

function getControllerInteractionHandlers({
  input,
  interactionState,
  messageActions,
}: {
  input: UseProposalMessageControllerInput;
  interactionState: ProposalMessageInteractionState;
  messageActions: ProposalMessageActions;
}): ProposalMessageInteractionHandlers {
  return createMessageItemInteractionHandlers({
    canToggleSelection: interactionState.canToggleSelection,
    message: input.message,
    onToggleReaction: messageActions.toggleReaction,
    onToggleSelected: input.onToggleSelected,
  });
}

function buildAvailableProposalMessageController({
  interactionHandlers,
  interactionState,
  isExpanded,
  runtime,
  setIsContextMenuOpen,
  toggleExpanded,
}: ProposalMessageControllerBuilderInput): AvailableProposalMessageController {
  const {
    handleMessageClick,
    handleMessageKeyDown,
    handleToggleReaction: toggleReaction,
  } = interactionHandlers;

  return {
    articleState: {
      canToggleSelection: interactionState.canToggleSelection,
      handleMessageClick,
      handleMessageKeyDown,
      messageAriaLabel: interactionState.messageAriaLabel,
      shouldShowOuterFocus: interactionState.shouldShowOuterFocus,
    },
    bubbleState: {
      canShowQuickReactions: interactionState.canShowQuickReactions,
      isInteractionFocused: interactionState.isInteractionFocused,
      isSaved: interactionState.isSaved,
    },
    contextMenuState: {
      isSaved: interactionState.isSaved,
      selectedReactionEmojis: interactionState.selectedReactionEmojis,
    },
    isAvailable: true,
    isExpanded,
    layoutState: {
      isReadByOthers: runtime.isReadByOthers,
      reactionGroups: runtime.reactionGroups,
    },
    messageActions: runtime.messageActions,
    proposalActions: runtime.proposalActions,
    setIsContextMenuOpen,
    swipeState: runtime.swipeState,
    toggleExpanded,
    toggleReaction,
    viewState: runtime.viewState,
  };
}
