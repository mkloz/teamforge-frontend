import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

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
    mutationKey: ["activity", "proposal", mutationKeyScope, "vote"],
    mutationFn: ({ proposalId, vote }: PlanProposalVoteInput) =>
      ActivityCommands.votePlanProposal(proposalId, { vote }, groupId),
    onSuccess: (_, { vote }) => {
      toast.success(
        vote === "APPROVE" ? "Proposal approved." : "Proposal rejected.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "We couldn't submit your vote right now."),
      );
    },
  });

  const withdrawMutation = useMutation({
    mutationKey: ["activity", "proposal", mutationKeyScope, "withdraw"],
    mutationFn: (proposalId: string) =>
      ActivityCommands.withdrawPlanProposal(proposalId, groupId),
    onSuccess: () => {
      toast.success("Proposal withdrawn.");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "We couldn't withdraw that proposal right now.",
        ),
      );
    },
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
