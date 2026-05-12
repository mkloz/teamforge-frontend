import type { PlanProposal } from "@/shared/schemas/plan";
import type { GroupPlanProposalActions } from "./types";

interface ProposalRowStateParams {
  actions: GroupPlanProposalActions;
  canVote: boolean;
  currentUserId: string;
  proposal: PlanProposal;
}

export function getProposalRowState({
  actions,
  canVote,
  currentUserId,
  proposal,
}: ProposalRowStateParams) {
  const approveCount = proposal.votes.filter(
    (vote) => vote.vote === "APPROVE",
  ).length;
  const rejectCount = proposal.votes.filter(
    (vote) => vote.vote === "REJECT",
  ).length;
  const viewerVote =
    proposal.votes.find((vote) => vote.userId === currentUserId)?.vote ?? null;
  const isOwnProposal = proposal.proposerId === currentUserId;

  return {
    approveCount,
    canActOnProposal:
      proposal.status === "PENDING" &&
      (isOwnProposal || (canVote && !viewerVote)),
    isApproving:
      actions.pendingVote?.proposalId === proposal.id &&
      actions.pendingVote.vote === "APPROVE",
    isOwnProposal,
    isRejecting:
      actions.pendingVote?.proposalId === proposal.id &&
      actions.pendingVote.vote === "REJECT",
    isWithdrawing: actions.withdrawingProposalId === proposal.id,
    rejectCount,
    viewerVote,
  };
}
