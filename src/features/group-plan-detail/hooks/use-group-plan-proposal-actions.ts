import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateGroupPlanProposalPayload,
  VoteGroupPlanProposalPayload,
} from "@/features/group-plan-detail/api/group-plan-detail.api";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { PlanProposal } from "@/shared/schemas";

interface UseGroupPlanProposalActionsOptions {
  groupId: string;
  planId: string | null;
}

interface ProposalVoteInput {
  proposalId: string;
  vote: VoteGroupPlanProposalPayload["vote"];
}

interface ProposalMutationContext {
  previousDetail: GroupPlanDetail | undefined;
}

function applyOptimisticProposalVote(
  proposal: PlanProposal,
  userId: string,
  vote: VoteGroupPlanProposalPayload["vote"],
) {
  const now = new Date().toISOString();

  return {
    ...proposal,
    updatedAt: now,
    version: Date.parse(now),
    votes: [
      ...proposal.votes.filter((item) => item.userId !== userId),
      {
        userId,
        vote,
        createdAt: now,
      },
    ],
  } satisfies PlanProposal;
}

function applyOptimisticProposalWithdraw(proposal: PlanProposal) {
  const now = new Date().toISOString();

  return {
    ...proposal,
    resolvedAt: now,
    status: "WITHDRAWN",
    updatedAt: now,
    version: Date.parse(now),
  } satisfies PlanProposal;
}

export function useGroupPlanProposalActions({
  groupId,
  planId,
}: UseGroupPlanProposalActionsOptions) {
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUserQuery();
  const detailQueryKey = APP_QUERY_KEYS.groupPlanDetail.byId(groupId);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  async function optimisticallyUpdateProposal(
    updater: (proposal: PlanProposal) => PlanProposal,
  ) {
    await queryClient.cancelQueries({ queryKey: detailQueryKey });

    const previousDetail =
      queryClient.getQueryData<GroupPlanDetail>(detailQueryKey);

    queryClient.setQueryData<GroupPlanDetail>(detailQueryKey, (current) => {
      if (!current) {
        return current;
      }

      const nextProposals = current.planning.proposals.map(updater);
      const pendingProposalCount = nextProposals.filter(
        (proposal) => proposal.status === "PENDING",
      ).length;

      return {
        ...current,
        planning: {
          ...current.planning,
          pendingProposalCount,
          proposals: nextProposals,
        },
      };
    });

    return { previousDetail } satisfies ProposalMutationContext;
  }

  function restoreDetail(context: ProposalMutationContext | undefined) {
    queryClient.setQueryData(detailQueryKey, context?.previousDetail);
  }

  const createMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't suggest that change right now.",
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
    },
    onError: (_error) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanCreateProposal,
        "error",
        {
          groupId,
          planId,
        },
      );
    },
  });

  const voteMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't submit your vote right now.",
      telemetryName: trackedMutationNames.groupPlanVoteProposal,
    },
    mutationKey: ["group-plan-detail", "proposal", "vote", groupId],
    mutationFn: ({ proposalId, vote }: ProposalVoteInput) =>
      GroupPlanDetailCommands.votePlanProposal(groupId, proposalId, { vote }),
    onMutate: ({ proposalId, vote }) =>
      optimisticallyUpdateProposal((proposal) =>
        proposal.id === proposalId && currentUserQuery.data?.id
          ? applyOptimisticProposalVote(
              proposal,
              currentUserQuery.data.id,
              vote,
            )
          : proposal,
      ),
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
    },
    onError: (_error, _input, context) => {
      restoreDetail(context);
      trackMutationOutcome(
        trackedMutationNames.groupPlanVoteProposal,
        "error",
        {
          groupId,
        },
      );
    },
  });

  const withdrawMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't withdraw that change right now.",
      telemetryName: trackedMutationNames.groupPlanWithdrawProposal,
    },
    mutationKey: ["group-plan-detail", "proposal", "withdraw", groupId],
    mutationFn: (proposalId: string) =>
      GroupPlanDetailCommands.withdrawPlanProposal(groupId, proposalId),
    onMutate: (proposalId) =>
      optimisticallyUpdateProposal((proposal) =>
        proposal.id === proposalId
          ? applyOptimisticProposalWithdraw(proposal)
          : proposal,
      ),
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
    },
    onError: (_error, _proposalId, context) => {
      restoreDetail(context);
      trackMutationOutcome(
        trackedMutationNames.groupPlanWithdrawProposal,
        "error",
        {
          groupId,
        },
      );
    },
  });

  async function createProposal(payload: CreateGroupPlanProposalPayload) {
    if (
      guardOfflineAction({
        id: "group-plan-proposal-create-offline",
        description: "Reconnect before suggesting plan changes.",
      })
    ) {
      throw new Error("You are offline. Reconnect before suggesting changes.");
    }

    return createMutation.mutateAsync(payload);
  }

  function submitVote(proposalId: string, vote: ProposalVoteInput["vote"]) {
    if (
      guardOfflineAction({
        id: "group-plan-proposal-vote-offline",
        description: "Reconnect before voting on plan changes.",
      })
    ) {
      return;
    }

    voteMutation.mutate({ proposalId, vote });
  }

  function withdrawProposal(proposalId: string) {
    if (
      guardOfflineAction({
        id: "group-plan-proposal-withdraw-offline",
        description: "Reconnect before withdrawing this plan change.",
      })
    ) {
      return;
    }

    withdrawMutation.mutate(proposalId);
  }

  return {
    approveProposal: (proposalId: string) => submitVote(proposalId, "APPROVE"),
    createProposal,
    rejectProposal: (proposalId: string) => submitVote(proposalId, "REJECT"),
    withdrawProposal,
    creatingField: createMutation.variables?.field ?? null,
    isCreating: createMutation.isPending,
    isOnline,
    isSubmitting: voteMutation.isPending || withdrawMutation.isPending,
    pendingVote: voteMutation.variables ?? null,
    withdrawingProposalId: withdrawMutation.variables ?? null,
  };
}
