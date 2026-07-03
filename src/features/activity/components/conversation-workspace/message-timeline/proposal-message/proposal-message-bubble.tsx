import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { ReplyReference } from "../message-item/reply-reference";
import { ProposalHeader } from "./proposal-header";
import { ProposalMessageDetailsSection } from "./proposal-message-details-section";
import { ProposalMessageFooter } from "./proposal-message-footer";
import { getProposalMessageBubbleClassName } from "./proposal-message-render-state";
import type {
  AvailableProposalMessageViewState,
  ProposalMessageInteractionState,
  ProposalMessageLayoutState,
  ProposalPlanActions,
} from "./proposal-message-types";

interface ProposalMessageBubbleProps {
  interactionState: ProposalMessageInteractionState;
  isExpanded: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  layoutState: ProposalMessageLayoutState;
  message: UnifiedMessage;
  onActivateReplyTarget: (messageId: string) => void;
  onToggleExpanded: () => void;
  onToggleReaction: (emoji: string) => void;
  proposalActions: ProposalPlanActions;
  viewState: AvailableProposalMessageViewState;
}

export function ProposalMessageBubble({
  interactionState,
  isExpanded,
  isHighlighted,
  isSelected,
  layoutState,
  message,
  onActivateReplyTarget,
  onToggleExpanded,
  onToggleReaction,
  proposalActions,
  viewState,
}: ProposalMessageBubbleProps) {
  const proposal = viewState.proposal;

  return (
    <div
      className={getProposalMessageBubbleClassName({
        interactionState,
        isHighlighted,
        isOwn: message.isOwn,
        isSelected,
      })}
    >
      <ReplyReference
        replyTo={message.replyTo}
        isOwn={message.isOwn}
        onActivate={onActivateReplyTarget}
      />

      <ProposalHeader
        field={proposal.field}
        isExpanded={isExpanded}
        onToggle={onToggleExpanded}
        status={proposal.status}
      />

      <ProposalMessageDetailsSection
        isExpanded={isExpanded}
        proposalActions={proposalActions}
        viewState={viewState}
      />

      <ProposalMessageFooter
        interactionState={interactionState}
        layoutState={layoutState}
        message={message}
        onToggleReaction={onToggleReaction}
      />
    </div>
  );
}
