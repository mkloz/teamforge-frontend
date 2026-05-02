import type { PlanProposal } from "@/shared/schemas/plan";

type ProposalVote = "APPROVE" | "REJECT";

function countVotes(proposal: PlanProposal, vote: ProposalVote) {
  return proposal.votes.filter((item) => item.vote === vote).length;
}

export function getPlanProposalViewState(
  proposal: PlanProposal,
  currentUserId?: string,
) {
  return {
    approveCount: countVotes(proposal, "APPROVE"),
    hasVoted:
      currentUserId !== undefined &&
      proposal.votes.some((item) => item.userId === currentUserId),
    isPending: proposal.status === "PENDING",
    isProposer: currentUserId === proposal.proposerId,
    rejectCount: countVotes(proposal, "REJECT"),
  };
}
