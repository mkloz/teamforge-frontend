import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export type ProposalMessageViewState = ReturnType<
  typeof getProposalMessageViewState
>;

type MessageProposal = NonNullable<UnifiedMessage["proposal"]>;
type ProposalVote = MessageProposal["votes"][number];
type ProposalVoteValue = ProposalVote["vote"];

interface ProposalVoteCounts {
  approveCount: number;
  rejectCount: number;
}

export function getProposalMessageViewState(
  message: UnifiedMessage,
  currentUserId?: string,
) {
  const proposal = message.proposal ?? null;

  if (!proposal) {
    return null;
  }

  const { approveCount, rejectCount } = getProposalVoteCounts(proposal.votes);
  const totalVotes = approveCount + rejectCount;
  const hasVoted = hasCurrentUserVoted(proposal.votes, currentUserId);
  const isPending = proposal.status === "PENDING";
  const isProposer = currentUserId === proposal.proposerId;
  const eligibleVoterCount = getEligibleVoterCount(message, proposal);

  return {
    approveCount,
    canVote: canCurrentUserVote({ currentUserId, hasVoted, isPending }),
    eligibleVoterCount,
    hasVoted,
    isPending,
    isProposer,
    proposal,
    proposalVoters: getProposalVoters(message),
    rejectCount,
    totalVotes,
    voteProgress: getVoteProgress(totalVotes, eligibleVoterCount),
  };
}

function getProposalVoteCounts(votes: ProposalVote[]): ProposalVoteCounts {
  return {
    approveCount: countProposalVotes(votes, "APPROVE"),
    rejectCount: countProposalVotes(votes, "REJECT"),
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
  currentUserId,
  hasVoted,
  isPending,
}: {
  currentUserId: string | undefined;
  hasVoted: boolean;
  isPending: boolean;
}) {
  return isPending && Boolean(currentUserId) && !hasVoted;
}

function getEligibleVoterCount(
  message: UnifiedMessage,
  proposal: MessageProposal,
) {
  return Math.max(
    message.proposalEligibleVoterCount ?? proposal.votes.length,
    proposal.votes.length,
    1,
  );
}

function getProposalVoters(message: UnifiedMessage) {
  return message.proposalVoters ?? [];
}

function getVoteProgress(totalVotes: number, eligibleVoterCount: number) {
  return Math.min(100, Math.round((totalVotes / eligibleVoterCount) * 100));
}
