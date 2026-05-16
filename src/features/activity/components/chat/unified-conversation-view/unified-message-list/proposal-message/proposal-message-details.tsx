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
  viewState: AvailableProposalMessageViewState;
}

export const ProposalMessageDetails = memo(function ProposalMessageDetails({
  isSubmitting,
  onApprove,
  onReject,
  onWithdraw,
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
    <div className="overflow-hidden px-2 pt-1 pb-2">
      <ProposalComparison
        current={formatProposalValue(proposal.field, proposal.currentValue)}
        proposed={formatProposalValue(proposal.field, proposal.proposedValue)}
      />

      <div className="mt-3 flex flex-col gap-2">
        <ProposalVoters
          voters={proposalVoters}
          score={`${totalVotes}/${eligibleVoterCount} votes`}
          progress={voteProgress}
        />

        <div className="flex items-center justify-between gap-3 text-micro text-muted-foreground">
          <span className="min-w-0 truncate">
            {formatProposalDate(proposal.createdAt)}
          </span>
          <span className="shrink-0 font-medium">
            {approveCount} approve · {rejectCount} reject
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
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
