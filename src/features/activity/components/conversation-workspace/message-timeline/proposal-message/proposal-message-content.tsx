import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { ProposalMessageBubble } from "./proposal-message-bubble";
import type { AvailableProposalMessageControllerState } from "./proposal-message-controller";
import {
  getProposalMessageContainerClassName,
  getProposalMessageStackClassName,
} from "./proposal-message-render-state";
import { ProposalMessageSender } from "./proposal-message-sender";
import type { AvailableProposalMessageViewState } from "./proposal-message-types";

interface ProposalMessageContentProps {
  isHighlighted: boolean;
  isSelected: boolean;
  message: UnifiedMessage;
  onActivateReplyTarget: (messageId: string) => void;
  proposalMessage: AvailableProposalMessageControllerState;
  showSender: boolean;
  viewState: AvailableProposalMessageViewState;
}

export function ProposalMessageContent({
  isHighlighted,
  isSelected,
  message,
  onActivateReplyTarget,
  proposalMessage,
  showSender,
  viewState,
}: ProposalMessageContentProps) {
  return (
    <div className={getProposalMessageContainerClassName(message.isOwn)}>
      <ProposalMessageSender
        message={message}
        proposalProposerName={viewState.proposal.proposer.name}
        showSender={showSender}
      />

      <div className={getProposalMessageStackClassName(message.isOwn)}>
        <ProposalMessageBubble
          interactionState={proposalMessage.bubbleState}
          isExpanded={proposalMessage.isExpanded}
          isHighlighted={isHighlighted}
          isSelected={isSelected}
          layoutState={proposalMessage.layoutState}
          message={message}
          onActivateReplyTarget={onActivateReplyTarget}
          onToggleExpanded={proposalMessage.toggleExpanded}
          onToggleReaction={proposalMessage.toggleReaction}
          proposalActions={proposalMessage.proposalActions}
          viewState={viewState}
        />
      </div>
    </div>
  );
}
