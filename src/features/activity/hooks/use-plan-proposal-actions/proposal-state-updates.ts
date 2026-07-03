import type { ProposalVote } from "@/features/activity/hooks/use-plan-proposal-actions/types";
import type { PlanProposal, User } from "@/shared/schemas";

export function addOptimisticVote(
  proposal: PlanProposal,
  currentUser: User,
  vote: ProposalVote,
  now: string,
): PlanProposal {
  return {
    ...proposal,
    updatedAt: now,
    version: Date.parse(now),
    votes: [
      ...proposal.votes.filter((item) => item.userId !== currentUser.id),
      {
        createdAt: now,
        userId: currentUser.id,
        vote,
      },
    ],
  };
}

export function markProposalWithdrawn(
  proposal: PlanProposal,
  now: string,
): PlanProposal {
  return {
    ...proposal,
    resolvedAt: now,
    status: "WITHDRAWN",
    updatedAt: now,
    version: Date.parse(now),
  };
}
