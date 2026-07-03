import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import {
  applyOptimisticProposalUpdate,
  restoreProposalSnapshot,
  writeConfirmedProposal,
} from "@/features/activity/hooks/use-plan-proposal-actions/proposal-cache";
import {
  addOptimisticVote,
  markProposalWithdrawn,
} from "@/features/activity/hooks/use-plan-proposal-actions/proposal-state-updates";
import type {
  PlanProposalVoteInput,
  ProposalVote,
  UsePlanProposalActionsOptions,
} from "@/features/activity/hooks/use-plan-proposal-actions/types";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

export function usePlanProposalActions({
  groupId,
  mutationKeyScope = "default",
}: UsePlanProposalActionsOptions = {}) {
  const queryClient = useQueryClient();
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const selectedGroupId = useActivityStore((state) =>
    state.selectedKind === "group" ? state.selectedId : null,
  );
  const effectiveGroupId = groupId ?? selectedGroupId ?? undefined;
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const voteMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't submit your vote right now.",
    },
    mutationKey: ["activity", "proposal", mutationKeyScope, "vote"],
    mutationFn: ({ proposalId, vote }: PlanProposalVoteInput) =>
      ActivityCommands.votePlanProposal(proposalId, { vote }, effectiveGroupId),
    onMutate: ({ proposalId, vote }) =>
      applyOptimisticProposalUpdate({
        currentUser: currentUserQuery.data ?? null,
        groupId: effectiveGroupId,
        proposalId,
        queryClient,
        updateProposal: (proposal, currentUser, now) =>
          addOptimisticVote(proposal, currentUser, vote, now),
      }),
    onError: (_error, _input, snapshot) => {
      restoreProposalSnapshot(queryClient, snapshot);
    },
    onSuccess: (proposal, _input, snapshot) => {
      writeConfirmedProposal(
        queryClient,
        snapshot,
        proposal,
        currentUserQuery.data ?? null,
      );
    },
  });

  const withdrawMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't withdraw that proposal right now.",
    },
    mutationKey: ["activity", "proposal", mutationKeyScope, "withdraw"],
    mutationFn: (proposalId: string) =>
      ActivityCommands.withdrawPlanProposal(proposalId, effectiveGroupId),
    onMutate: (proposalId) =>
      applyOptimisticProposalUpdate({
        currentUser: currentUserQuery.data ?? null,
        groupId: effectiveGroupId,
        proposalId,
        queryClient,
        updateProposal: (proposal, _currentUser, now) =>
          markProposalWithdrawn(proposal, now),
      }),
    onError: (_error, _input, snapshot) => {
      restoreProposalSnapshot(queryClient, snapshot);
    },
    onSuccess: (proposal, _input, snapshot) => {
      writeConfirmedProposal(
        queryClient,
        snapshot,
        proposal,
        currentUserQuery.data ?? null,
      );
    },
  });

  async function submitVote(proposalId: string, vote: ProposalVote) {
    if (
      guardOfflineAction({
        id: "activity-plan-proposal-vote-offline",
        description: "Reconnect before voting on plan changes.",
      })
    ) {
      return null;
    }

    return voteMutation.mutateAsync({ proposalId, vote });
  }

  async function withdrawProposal(proposalId: string) {
    if (
      guardOfflineAction({
        id: "activity-plan-proposal-withdraw-offline",
        description: "Reconnect before withdrawing that proposal.",
      })
    ) {
      return null;
    }

    return withdrawMutation.mutateAsync(proposalId);
  }

  return {
    approveProposal: (proposalId: string) => submitVote(proposalId, "APPROVE"),
    rejectProposal: (proposalId: string) => submitVote(proposalId, "REJECT"),
    withdrawProposal,
    isVoting: voteMutation.isPending,
    isOnline,
    isWithdrawing: withdrawMutation.isPending,
    isSubmitting: voteMutation.isPending || withdrawMutation.isPending,
  };
}
