import { useMutation } from "@tanstack/react-query";

import { ActivityCommands } from "@/features/activity/api/activity-commands";

type ProposalVote = "APPROVE" | "REJECT";

interface PlanProposalVoteInput {
  proposalId: string;
  vote: ProposalVote;
}

interface UsePlanProposalActionsOptions {
  groupId?: string;
  mutationKeyScope?: string;
}

export function usePlanProposalActions({
  groupId,
  mutationKeyScope = "default",
}: UsePlanProposalActionsOptions = {}) {
  const voteMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't submit your vote right now.",
    },
    mutationKey: ["activity", "proposal", mutationKeyScope, "vote"],
    mutationFn: ({ proposalId, vote }: PlanProposalVoteInput) =>
      ActivityCommands.votePlanProposal(proposalId, { vote }, groupId),
  });

  const withdrawMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't withdraw that proposal right now.",
    },
    mutationKey: ["activity", "proposal", mutationKeyScope, "withdraw"],
    mutationFn: (proposalId: string) =>
      ActivityCommands.withdrawPlanProposal(proposalId, groupId),
  });

  return {
    approveProposal: (proposalId: string) =>
      voteMutation.mutateAsync({ proposalId, vote: "APPROVE" }),
    rejectProposal: (proposalId: string) =>
      voteMutation.mutateAsync({ proposalId, vote: "REJECT" }),
    withdrawProposal: (proposalId: string) =>
      withdrawMutation.mutateAsync(proposalId),
    isVoting: voteMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    isSubmitting: voteMutation.isPending || withdrawMutation.isPending,
  };
}
