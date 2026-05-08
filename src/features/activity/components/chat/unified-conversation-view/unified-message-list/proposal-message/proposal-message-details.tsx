import { memo } from "react";

import {
  formatProposalDate,
  formatProposalValue,
} from "@/features/activity/lib/proposal-language";

import { ProposalActions } from "./proposal-actions";
import { ProposalComparison } from "./proposal-comparison";
import type { ProposalMessageViewState } from "./proposal-message-view-model";
import { ProposalVoters } from "./proposal-voters";

type AvailableProposalMessageViewState = NonNullable<ProposalMessageViewState>;

interface ProposalMessageDetailsProps {
  isSubmitting: boolean;
  onApprove: () => void;
  onReject: () => void;
  onWithdraw: () => void;
  summaryText: string;
  viewState: AvailableProposalMessageViewState;
}

export const ProposalMessageDetails = memo(function ProposalMessageDetails({
  isSubmitting,
  onApprove,
  onReject,
  onWithdraw,
  summaryText,
  viewState,
}: ProposalMessageDetailsProps) {
  const {
    approveCount,
    canVote,
    eligibleVoterCount,
    hasVoted,
    isPending,
    isProposer,
    proposal,
    proposalVoters,
    rejectCount,
    totalVotes,
    voteProgress,
  } = viewState;

  return (
    <div className="overflow-hidden px-3 pb-3">
      <p className="mb-3 text-muted-foreground text-xs">{summaryText}</p>

      <ProposalComparison
        current={formatProposalValue(proposal.field, proposal.currentValue)}
        proposed={formatProposalValue(proposal.field, proposal.proposedValue)}
      />

      <div className="mt-4 flex flex-col gap-2">
        <ProposalVoters
          voters={proposalVoters}
          score={`${totalVotes}/${eligibleVoterCount} votes`}
          progress={voteProgress}
        />

        <div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
          <span>{formatProposalDate(proposal.createdAt)}</span>
          <span className="font-medium">
            {approveCount} approve · {rejectCount} reject
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <ProposalActions
          canVote={canVote}
          hasVoted={hasVoted}
          isPending={isPending}
          isProposer={isProposer}
          isSubmitting={isSubmitting}
          onApprove={onApprove}
          onReject={onReject}
          onWithdraw={onWithdraw}
        />
      </div>
    </div>
  );
});
