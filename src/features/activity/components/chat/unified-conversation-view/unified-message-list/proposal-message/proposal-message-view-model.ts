import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export type ProposalMessageViewState = ReturnType<
  typeof getProposalMessageViewState
>;

export function getProposalMessageViewState(
  message: UnifiedMessage,
  currentUserId?: string,
) {
  const proposal = message.proposal ?? null;

  if (!proposal) {
    return null;
  }

  const approveCount = proposal.votes.filter(
    (vote) => vote.vote === "APPROVE",
  ).length;
  const rejectCount = proposal.votes.filter(
    (vote) => vote.vote === "REJECT",
  ).length;
  const totalVotes = approveCount + rejectCount;
  const hasVoted =
    currentUserId !== undefined &&
    proposal.votes.some((vote) => vote.userId === currentUserId);
  const isPending = proposal.status === "PENDING";
  const isProposer = currentUserId === proposal.proposerId;
  const eligibleVoterCount = Math.max(
    message.proposalEligibleVoterCount ?? proposal.votes.length,
    proposal.votes.length,
    1,
  );

  return {
    approveCount,
    canVote: isPending && !isProposer && !hasVoted,
    eligibleVoterCount,
    hasVoted,
    isPending,
    isProposer,
    proposal,
    proposalVoters: message.proposalVoters ?? [],
    rejectCount,
    totalVotes,
    voteProgress: Math.min(
      100,
      Math.round((totalVotes / eligibleVoterCount) * 100),
    ),
  };
}
