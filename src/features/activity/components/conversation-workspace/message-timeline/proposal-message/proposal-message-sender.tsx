import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { getProposalMessageSenderViewState } from "./proposal-message-render-state";

interface ProposalMessageSenderProps {
  message: UnifiedMessage;
  proposalProposerName: string;
  showSender: boolean;
}

export function ProposalMessageSender({
  message,
  proposalProposerName,
  showSender,
}: ProposalMessageSenderProps) {
  const sender = getProposalMessageSenderViewState({
    message,
    proposalProposerName,
    showSender,
  });

  if (!sender.isVisible) {
    return null;
  }

  return (
    <p className="mb-0.5 ml-1.5 font-bold text-primary text-xs opacity-90">
      {sender.senderName}
    </p>
  );
}
