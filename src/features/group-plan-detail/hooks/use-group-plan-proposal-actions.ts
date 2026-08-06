import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateGroupPlanProposalPayload,
  VoteGroupPlanProposalPayload,
} from "@/features/group-plan-detail/api/group-plan-detail.api";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import {
  type GroupPlanDetailResponse,
  isRichGroupPlanDetail,
} from "@/features/group-plan-detail/lib/group-plan-detail-contract";
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
  previousDetails: [readonly unknown[], GroupPlanDetailResponse | undefined][];
}

type ProposalUpdater = (proposal: PlanProposal) => PlanProposal;
type OfflineActionGuard = ReturnType<
  typeof useOfflineActionGuard
>["guardOfflineAction"];
type OfflineActionConfig = Parameters<OfflineActionGuard>[0];

const CREATE_PROPOSAL_MISSING_PLAN_ERROR =
  "This group does not have a plan to change yet.";
const CREATE_PROPOSAL_OFFLINE_ERROR =
  "You are offline. Reconnect before suggesting changes.";
const PENDING_PROPOSAL_STATUS = "PENDING";

const PROPOSAL_OFFLINE_ACTIONS = {
  create: {
    id: "group-plan-proposal-create-offline",
    description: "Reconnect before suggesting plan changes.",
  },
  vote: {
    id: "group-plan-proposal-vote-offline",
    description: "Reconnect before voting on plan changes.",
  },
  withdraw: {
    id: "group-plan-proposal-withdraw-offline",
    description: "Reconnect before withdrawing this plan change.",
  },
} satisfies Record<"create" | "vote" | "withdraw", OfflineActionConfig>;

function applyOptimisticProposalVote(
  proposal: PlanProposal,
  userId: string,
  vote: VoteGroupPlanProposalPayload["vote"],
) {
  const now = getOptimisticProposalTimestamp();
  const previousVote = proposal.votes.find(
    (item) => item.userId === userId,
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
      ...proposal.votes.filter((item) => item.userId !== userId),
      {
        userId,
        vote,
        createdAt: now,
      },
    ],
  } satisfies PlanProposal;
}

function getOptimisticApprovalCount(
  currentCount: number,
  previousVote: VoteGroupPlanProposalPayload["vote"] | undefined,
  nextVote: VoteGroupPlanProposalPayload["vote"],
) {
  const previousApproval = previousVote === "APPROVE" ? 1 : 0;
  const nextApproval = nextVote === "APPROVE" ? 1 : 0;

  return Math.max(0, currentCount - previousApproval + nextApproval);
}

function applyOptimisticProposalWithdraw(proposal: PlanProposal) {
  const now = getOptimisticProposalTimestamp();

  return {
    ...proposal,
    resolvedAt: now,
    status: "WITHDRAWN",
    updatedAt: now,
    version: Date.parse(now),
  } satisfies PlanProposal;
}

function getOptimisticProposalTimestamp() {
  return new Date().toISOString();
}

function getDetailWithUpdatedProposals(
  current: GroupPlanDetailResponse | undefined,
  updater: ProposalUpdater,
) {
  if (!isRichGroupPlanDetail(current)) {
    return current;
  }

  const proposals = current.planning.proposals.map(updater);

  return {
    ...current,
    planning: {
      ...current.planning,
      pendingProposalCount: getPendingProposalCount(proposals),
      proposals,
    },
  };
}

function getPendingProposalCount(proposals: PlanProposal[]) {
  return proposals.filter(isPendingProposal).length;
}

function isPendingProposal(proposal: PlanProposal) {
  return proposal.status === PENDING_PROPOSAL_STATUS;
}

function updateProposalVoteForUser({
  currentUserId,
  proposal,
  proposalId,
  vote,
}: {
  currentUserId: string | undefined;
  proposal: PlanProposal;
  proposalId: string;
  vote: ProposalVoteInput["vote"];
}) {
  if (!currentUserId || !isProposalTarget(proposal, proposalId)) {
    return proposal;
  }

  return applyOptimisticProposalVote(proposal, currentUserId, vote);
}

function updateWithdrawnProposal(proposal: PlanProposal, proposalId: string) {
  return isProposalTarget(proposal, proposalId)
    ? applyOptimisticProposalWithdraw(proposal)
    : proposal;
}

function isProposalTarget(proposal: PlanProposal, proposalId: string) {
  return proposal.id === proposalId;
}

function requirePlanId(planId: string | null) {
  if (!planId) {
    throw new Error(CREATE_PROPOSAL_MISSING_PLAN_ERROR);
  }

  return planId;
}

function assertCanCreateProposal(guardOfflineAction: OfflineActionGuard) {
  if (guardOfflineAction(PROPOSAL_OFFLINE_ACTIONS.create)) {
    throw new Error(CREATE_PROPOSAL_OFFLINE_ERROR);
  }
}

function runGuardedProposalAction(
  guardOfflineAction: OfflineActionGuard,
  offlineAction: OfflineActionConfig,
  action: () => void,
) {
  if (guardOfflineAction(offlineAction)) {
    return;
  }

  action();
}

export function useGroupPlanProposalActions({
  groupId,
  planId,
}: UseGroupPlanProposalActionsOptions) {
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUserQuery();
  const detailQueryKey =
    APP_QUERY_KEYS.groupPlanDetail.detailAllScopes(groupId);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  async function optimisticallyUpdateProposal(updater: ProposalUpdater) {
    await queryClient.cancelQueries({ queryKey: detailQueryKey });

    const previousDetails = queryClient.getQueriesData<GroupPlanDetailResponse>(
      {
        queryKey: detailQueryKey,
      },
    );

    queryClient.setQueriesData<GroupPlanDetailResponse>(
      { queryKey: detailQueryKey },
      (current) => getDetailWithUpdatedProposals(current, updater),
    );

    return { previousDetails } satisfies ProposalMutationContext;
  }

  function restoreDetail(context: ProposalMutationContext | undefined) {
    context?.previousDetails.forEach(([queryKey, previousDetail]) => {
      queryClient.setQueryData(queryKey, previousDetail);
    });
  }

  const createMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't suggest that change right now.",
      telemetryName: trackedMutationNames.groupPlanCreateProposal,
    },
    mutationKey: ["group-plan-detail", "proposal", "create", groupId, planId],
    mutationFn: (payload: CreateGroupPlanProposalPayload) => {
      return GroupPlanDetailCommands.createPlanProposal(
        groupId,
        requirePlanId(planId),
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
        updateProposalVoteForUser({
          currentUserId: currentUserQuery.data?.id,
          proposal,
          proposalId,
          vote,
        }),
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
        updateWithdrawnProposal(proposal, proposalId),
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
    assertCanCreateProposal(guardOfflineAction);

    return createMutation.mutateAsync(payload);
  }

  function submitVote(proposalId: string, vote: ProposalVoteInput["vote"]) {
    runGuardedProposalAction(
      guardOfflineAction,
      PROPOSAL_OFFLINE_ACTIONS.vote,
      () => voteMutation.mutate({ proposalId, vote }),
    );
  }

  function withdrawProposal(proposalId: string) {
    runGuardedProposalAction(
      guardOfflineAction,
      PROPOSAL_OFFLINE_ACTIONS.withdraw,
      () => withdrawMutation.mutate(proposalId),
    );
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
