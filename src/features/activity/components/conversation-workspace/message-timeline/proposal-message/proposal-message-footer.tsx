import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { MessageFooter } from "../message-item/message-footer";
import { getProposalMessageFooterState } from "./proposal-message-footer-state";
import type {
  ProposalMessageInteractionState,
  ProposalMessageLayoutState,
} from "./proposal-message-types";

interface ProposalMessageFooterProps {
  interactionState: ProposalMessageInteractionState;
  layoutState: ProposalMessageLayoutState;
  message: UnifiedMessage;
  onToggleReaction: (emoji: string) => void;
}

export function ProposalMessageFooter({
  interactionState,
  layoutState,
  message,
  onToggleReaction,
}: ProposalMessageFooterProps) {
  return (
    <MessageFooter
      {...getProposalMessageFooterState({
        interactionState,
        layoutState,
        message,
        onToggleReaction,
      })}
    />
  );
}
