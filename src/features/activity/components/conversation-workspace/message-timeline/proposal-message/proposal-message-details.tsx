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
  isVoting: boolean;
  isWithdrawing: boolean;
  isOnline: boolean;
  onApprove: () => void;
  onReject: () => void;
  onWithdraw: () => Promise<void> | void;
  viewState: AvailableProposalMessageViewState;
}

export function ProposalMessageDetails({
  isVoting,
  isWithdrawing,
  isOnline,
  onApprove,
  onReject,
  onWithdraw,
  viewState,
}: ProposalMessageDetailsProps) {
  const {
    activeApprovalCount,
    approvalThreshold,
    canVote,
    canVoteOnPlanChange,
    hasVoted,
    isPending,
    isProposer,
    proposal,
    proposalVoters,
    rejectCount,
    voteProgress,
  } = viewState;
  const shouldShowActions = isPending;

  return (
    <div className="overflow-hidden px-2 py-1">
      <ProposalComparison
        current={formatProposalValue(proposal.field, proposal.currentValue)}
        proposed={formatProposalValue(proposal.field, proposal.proposedValue)}
      />

      <div className="mt-2 flex flex-col gap-1.5">
        <ProposalVoters
          voters={proposalVoters}
          score={`${activeApprovalCount}/${approvalThreshold} approvals`}
          progress={voteProgress}
        />

        <div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
          <span className="min-w-0 truncate">
            {formatProposalDate(proposal.createdAt)}
          </span>
          <span className="shrink-0 font-medium">
            {activeApprovalCount} approve · {rejectCount} against
          </span>
        </div>
      </div>

      {shouldShowActions ? (
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <ProposalActions
            state={{
              canVote,
              canVoteOnPlanChange,
              hasVoted,
              isPending,
              isProposer,
              isOnline,
              isVoting,
              isWithdrawing,
            }}
            onApprove={onApprove}
            onReject={onReject}
            onWithdraw={onWithdraw}
          />
        </div>
      ) : null}
    </div>
  );
}
