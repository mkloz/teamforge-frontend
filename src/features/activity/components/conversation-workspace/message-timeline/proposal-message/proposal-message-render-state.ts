import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import type { AvailableProposalMessageControllerState } from "./proposal-message-controller";

const PROPOSAL_SWIPE_SHELL_STATE_BY_OWNERSHIP = {
  own: {
    dragConstraints: { left: -100, right: 0 },
    dragSurfaceClassName: cn(
      "relative z-10 flex w-full min-w-0 items-end",
      "justify-end",
    ),
    replyIndicatorClassName: cn(
      "absolute top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary/20 text-foreground",
      "right-10",
    ),
    replyIndicatorX: -20,
  },
  other: {
    dragConstraints: { left: 0, right: 100 },
    dragSurfaceClassName: cn(
      "relative z-10 flex w-full min-w-0 items-end",
      "justify-start",
    ),
    replyIndicatorClassName: cn(
      "absolute top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary/20 text-foreground",
      "left-10",
    ),
    replyIndicatorX: 20,
  },
} as const;

type ProposalMessageArticleState =
  AvailableProposalMessageControllerState["articleState"];
type ProposalMessageInteractionState =
  AvailableProposalMessageControllerState["bubbleState"];
type ProposalSwipeShellOwnershipState =
  (typeof PROPOSAL_SWIPE_SHELL_STATE_BY_OWNERSHIP)[keyof typeof PROPOSAL_SWIPE_SHELL_STATE_BY_OWNERSHIP];

export function getProposalArticleClassName(
  articleState: ProposalMessageArticleState,
) {
  return cn(
    "group relative w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    articleState.canToggleSelection && "cursor-pointer",
    articleState.shouldShowOuterFocus ? "overflow-visible" : "overflow-hidden",
  );
}

export function getProposalMessageContainerClassName(isOwn: boolean) {
  return cn(
    "group/proposal flex w-full min-w-0 max-w-xs flex-col sm:max-w-md",
    isOwn ? "ml-auto items-end" : "mr-auto items-start",
  );
}

export function getProposalMessageStackClassName(isOwn: boolean) {
  return cn(
    "flex w-full min-w-0 max-w-full flex-col gap-1",
    isOwn ? "items-end" : "items-start",
  );
}

export function getProposalSwipeShellStateForOwnership(
  isOwn: boolean,
): ProposalSwipeShellOwnershipState {
  return isOwn
    ? PROPOSAL_SWIPE_SHELL_STATE_BY_OWNERSHIP.own
    : PROPOSAL_SWIPE_SHELL_STATE_BY_OWNERSHIP.other;
}

interface ProposalMessageSenderViewStateInput {
  message: UnifiedMessage;
  proposalProposerName: string;
  showSender: boolean;
}

type ProposalMessageSenderViewState =
  | { isVisible: false; senderName: null }
  | { isVisible: true; senderName: string };

export function getProposalMessageSenderViewState({
  message,
  proposalProposerName,
  showSender,
}: ProposalMessageSenderViewStateInput): ProposalMessageSenderViewState {
  if (!(showSender && !message.isOwn)) {
    return { isVisible: false, senderName: null };
  }

  const senderName = message.sender?.name || proposalProposerName;

  if (!senderName) {
    return { isVisible: false, senderName: null };
  }

  return { isVisible: true, senderName };
}

interface ProposalMessageBubbleClassNameOptions {
  interactionState: Pick<
    ProposalMessageInteractionState,
    "isInteractionFocused"
  >;
  isHighlighted: boolean;
  isOwn: boolean;
  isSelected: boolean;
}

export function getProposalMessageBubbleClassName({
  interactionState,
  isHighlighted,
  isOwn,
  isSelected,
}: ProposalMessageBubbleClassNameOptions) {
  return cn(
    "relative flex w-full min-w-0 max-w-full flex-col rounded-xl border px-1 py-1 shadow-sm backdrop-blur-md transition duration-300",
    getProposalMessageBubbleOwnershipClassName(isOwn),
    getProposalMessageBubbleFocusClassName({
      interactionState,
      isHighlighted,
    }),
    isSelected && "border-primary/65 bg-primary-soft ring-1 ring-primary/35",
  );
}

function getProposalMessageBubbleOwnershipClassName(isOwn: boolean) {
  return isOwn
    ? "rounded-br-none border-primary/15 bg-primary-soft text-ink"
    : "rounded-bl-none border-border/60 bg-card/75 text-ink";
}

function getProposalMessageBubbleFocusClassName({
  interactionState,
  isHighlighted,
}: Pick<
  ProposalMessageBubbleClassNameOptions,
  "interactionState" | "isHighlighted"
>) {
  if (isHighlighted) {
    return "message-search-focus";
  }

  return interactionState.isInteractionFocused
    ? "message-action-focus"
    : undefined;
}
