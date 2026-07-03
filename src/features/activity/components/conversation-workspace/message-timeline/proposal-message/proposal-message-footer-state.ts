import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type {
  ProposalMessageInteractionState,
  ProposalMessageLayoutState,
} from "./proposal-message-types";

const PROPOSAL_QUICK_REACTIONS = ["👍", "👀"] as const;

interface ProposalMessageFooterStateInput {
  interactionState: ProposalMessageInteractionState;
  layoutState: ProposalMessageLayoutState;
  message: UnifiedMessage;
  onToggleReaction: (emoji: string) => void;
}

export function getProposalMessageFooterState({
  interactionState,
  layoutState,
  message,
  onToggleReaction,
}: ProposalMessageFooterStateInput) {
  return {
    attachments: message.attachments,
    content: message.content,
    createdAt: message.createdAt,
    footerState: {
      hasReply: Boolean(message.replyTo),
      isEdited: message.isEdited,
      isOwn: message.isOwn,
      isPinned: message.isPinned,
      isReadByOthers: layoutState.isReadByOthers,
      isSaved: interactionState.isSaved,
    },
    reactionGroups: layoutState.reactionGroups,
    readBy: message.readBy,
    readByCount: message.readByCount,
    status: message.status,
    onToggleReaction,
    reactionPlaceholderEmojis:
      getProposalReactionPlaceholders(interactionState),
  };
}

function getProposalReactionPlaceholders({
  canShowQuickReactions,
}: ProposalMessageInteractionState) {
  return canShowQuickReactions ? PROPOSAL_QUICK_REACTIONS : undefined;
}
