import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateGroupPlanProposalPayload,
  VoteGroupPlanProposalPayload,
} from "@/features/group-plan-detail/api/group-plan-detail.api";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

interface UseGroupPlanProposalActionsOptions {
  groupId: string;
  planId: string | null;
}

interface ProposalVoteInput {
  proposalId: string;
  vote: VoteGroupPlanProposalPayload["vote"];
}

export function useGroupPlanProposalActions({
  groupId,
  planId,
}: UseGroupPlanProposalActionsOptions) {
  const createMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.groupPlanCreateProposal,
    },
    mutationKey: ["group-plan-detail", "proposal", "create", groupId, planId],
    mutationFn: (payload: CreateGroupPlanProposalPayload) => {
      if (!planId) {
        throw new Error("This group does not have a plan to change yet.");
      }

      return GroupPlanDetailCommands.createPlanProposal(
        groupId,
        planId,
        payload,
      );
    },
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanCreateProposal,
        "success",
        {
          groupId,
          planId,
          proposalId: result.data.id,
          requestId: result.requestId,
        },
      );
      toast.success("Plan change suggested.");
    },
    onError: (error) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanCreateProposal,
        "error",
        {
          groupId,
          planId,
        },
      );
      toast.error(
        getApiErrorMessage(error, "We couldn't suggest that change right now."),
      );
    },
  });

  const voteMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.groupPlanVoteProposal,
    },
    mutationKey: ["group-plan-detail", "proposal", "vote", groupId],
    mutationFn: ({ proposalId, vote }: ProposalVoteInput) =>
      GroupPlanDetailCommands.votePlanProposal(groupId, proposalId, { vote }),
    onSuccess: (result, input) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanVoteProposal,
        "success",
        {
          groupId,
          proposalId: result.data.id,
          requestId: result.requestId,
          vote: input.vote,
        },
      );
      toast.success(
        input.vote === "APPROVE"
          ? "Plan change approved."
          : "Plan change rejected.",
      );
    },
    onError: (error) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanVoteProposal,
        "error",
        {
          groupId,
        },
      );
      toast.error(
        getApiErrorMessage(error, "We couldn't submit your vote right now."),
      );
    },
  });

  const withdrawMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.groupPlanWithdrawProposal,
    },
    mutationKey: ["group-plan-detail", "proposal", "withdraw", groupId],
    mutationFn: (proposalId: string) =>
      GroupPlanDetailCommands.withdrawPlanProposal(groupId, proposalId),
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanWithdrawProposal,
        "success",
        {
          groupId,
          proposalId: result.data.id,
          requestId: result.requestId,
        },
      );
      toast.success("Plan change withdrawn.");
    },
    onError: (error) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanWithdrawProposal,
        "error",
        {
          groupId,
        },
      );
      toast.error(
        getApiErrorMessage(
          error,
          "We couldn't withdraw that change right now.",
        ),
      );
    },
  });

  return {
    approveProposal: (proposalId: string) =>
      voteMutation.mutate({ proposalId, vote: "APPROVE" }),
    createProposal: createMutation.mutateAsync,
    rejectProposal: (proposalId: string) =>
      voteMutation.mutate({ proposalId, vote: "REJECT" }),
    withdrawProposal: withdrawMutation.mutate,
    creatingField: createMutation.variables?.field ?? null,
    isCreating: createMutation.isPending,
    isSubmitting: voteMutation.isPending || withdrawMutation.isPending,
    pendingVote: voteMutation.variables ?? null,
    withdrawingProposalId: withdrawMutation.variables ?? null,
  };
}
