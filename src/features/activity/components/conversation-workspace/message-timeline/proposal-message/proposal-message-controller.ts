import { useState } from "react";

import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import { useSwipeToReply } from "@/features/activity/hooks/use-swipe-to-reply";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { createMessageItemInteractionHandlers } from "../message-item/message-item-interactions";
import { getProposalMessageInteractionState } from "./proposal-message-interaction-state";
import { getProposalMessageViewState } from "./proposal-message-view-model";

interface UseProposalMessageControllerInput {
  isHighlighted: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
  message: UnifiedMessage;
  onToggleSelected?: (message: UnifiedMessage) => void;
}

type AvailableProposalMessageViewState = NonNullable<
  ReturnType<typeof getProposalMessageViewState>
>;
type ProposalMessageActions = ReturnType<typeof useActivityMessageActions>;
type ProposalPlanActions = ReturnType<typeof usePlanProposalActions>;
type ProposalMessageInteractionState = ReturnType<
  typeof getProposalMessageInteractionState
>;
type ProposalMessageLayoutState = ReturnType<typeof useMessageLayout>;
type ProposalMessageSwipeState = ReturnType<typeof useSwipeToReply>;
type ProposalMessageInteractionHandlers = ReturnType<
  typeof createMessageItemInteractionHandlers
>;
type SavedMessageIds = ReturnType<typeof useSavedMessageIds>;

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

interface ProposalMessageRuntimeState {
  isReadByOthers: ProposalMessageLayoutState["isReadByOthers"];
  messageActions: ProposalMessageActions;
  proposalActions: ProposalPlanActions;
  reactionGroups: ProposalMessageLayoutState["reactionGroups"];
  savedMessageIds: SavedMessageIds;
  swipeState: ProposalMessageSwipeState;
  viewState: ReturnType<typeof getProposalMessageViewState>;
}

interface AvailableProposalMessageRuntimeState
  extends ProposalMessageRuntimeState {
  viewState: AvailableProposalMessageViewState;
}

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

function useProposalMessageRuntime(
  message: UnifiedMessage,
): ProposalMessageRuntimeState {
  const { data: currentUser } = useCurrentUserQuery();
  const viewState = getProposalMessageViewState(message, currentUser?.id);
  const { reactionGroups, isReadByOthers } = useMessageLayout({
    message,
    isOwn: message.isOwn,
  });
  const swipeState = useSwipeToReply(message, message.isOwn);
  const messageActions = useActivityMessageActions();
  const savedMessageIds = useSavedMessageIds();
  const proposalActions = usePlanProposalActions({
    mutationKeyScope: `message-${viewState?.proposal.id ?? "missing"}`,
  });

  return {
    isReadByOthers,
    messageActions,
    proposalActions,
    reactionGroups,
    savedMessageIds,
    swipeState,
    viewState,
  };
}

function hasProposalMessageViewState(
  runtime: ProposalMessageRuntimeState,
): runtime is AvailableProposalMessageRuntimeState {
  return Boolean(runtime.viewState);
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
