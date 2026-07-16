import type { ProposalVote } from "@/features/activity/hooks/use-plan-proposal-actions/types";
import type { PlanProposal, User } from "@/shared/schemas";

export function addOptimisticVote(
  proposal: PlanProposal,
  currentUser: User,
  vote: ProposalVote,
  now: string,
): PlanProposal {
  const previousVote = proposal.votes.find(
    (item) => item.userId === currentUser.id,
  )?.vote;

  return {
    ...proposal,
    activeApprovalCount: getOptimisticApprovalCount(
      proposal.activeApprovalCount,
      previousVote,
      vote,
    ),
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

function getOptimisticApprovalCount(
  currentCount: number,
  previousVote: ProposalVote | undefined,
  nextVote: ProposalVote,
) {
  const previousApproval = previousVote === "APPROVE" ? 1 : 0;
  const nextApproval = nextVote === "APPROVE" ? 1 : 0;

  return Math.max(0, currentCount - previousApproval + nextApproval);
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
