import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export type ProposalMessageViewState = ReturnType<
  typeof getProposalMessageViewState
>;

type MessageProposal = NonNullable<UnifiedMessage["proposal"]>;
type ProposalVote = MessageProposal["votes"][number];
type ProposalVoteValue = ProposalVote["vote"];

export function getProposalMessageViewState(
  message: UnifiedMessage,
  currentUserId?: string,
  canVoteOnPlanChange = true,
) {
  const proposal = message.proposal ?? null;

  if (!proposal) {
    return null;
  }

  const rejectCount = countProposalVotes(proposal.votes, "REJECT");
  const activeApprovalCount = proposal.activeApprovalCount;
  const hasVoted = hasCurrentUserVoted(proposal.votes, currentUserId);
  const isPending = proposal.status === "PENDING";
  const isProposer = currentUserId === proposal.proposerId;
  const approvalThreshold = proposal.approvalThreshold;

  return {
    activeApprovalCount,
    approvalThreshold,
    canVoteOnPlanChange,
    canVote: canCurrentUserVote({
      canVoteOnPlanChange,
      currentUserId,
      hasVoted,
      isPending,
    }),
    hasVoted,
    isPending,
    isProposer,
    proposal,
    proposalVoters: getProposalVoters(message),
    rejectCount,
    voteProgress: getVoteProgress(activeApprovalCount, approvalThreshold),
  };
}

function countProposalVotes(
  votes: ProposalVote[],
  voteValue: ProposalVoteValue,
) {
  return votes.filter((vote) => vote.vote === voteValue).length;
}

function hasCurrentUserVoted(
  votes: ProposalVote[],
  currentUserId: string | undefined,
) {
  if (currentUserId === undefined) {
    return false;
  }

  return votes.some((vote) => vote.userId === currentUserId);
}

function canCurrentUserVote({
  canVoteOnPlanChange,
  currentUserId,
  hasVoted,
  isPending,
}: {
  canVoteOnPlanChange: boolean;
  currentUserId: string | undefined;
  hasVoted: boolean;
  isPending: boolean;
}) {
  return (
    canVoteOnPlanChange && isPending && Boolean(currentUserId) && !hasVoted
  );
}

function getProposalVoters(message: UnifiedMessage) {
  return message.proposalVoters ?? [];
}

function getVoteProgress(approvalCount: number, approvalThreshold: number) {
  return Math.min(100, Math.round((approvalCount / approvalThreshold) * 100));
}
