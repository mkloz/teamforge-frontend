import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { ActivityGroupSelectionData } from "@/features/activity/api/activity-query-data";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import type { PlanProposal, User } from "@/shared/schemas";

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
        updateProposal: (proposal, _currentUser, now) => ({
          ...proposal,
          resolvedAt: now,
          status: "WITHDRAWN",
          updatedAt: now,
          version: Date.parse(now),
        }),
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

interface ProposalSnapshot {
  groupId?: string;
  planId?: string;
  previousProposals?: PlanProposal[];
  previousSelection?: ActivityGroupSelectionData;
}

interface ApplyOptimisticProposalUpdateInput {
  currentUser: User | null;
  groupId?: string;
  proposalId: string;
  queryClient: ReturnType<typeof useQueryClient>;
  updateProposal: (
    proposal: PlanProposal,
    currentUser: User,
    now: string,
  ) => PlanProposal;
}

async function applyOptimisticProposalUpdate({
  currentUser,
  groupId,
  proposalId,
  queryClient,
  updateProposal,
}: ApplyOptimisticProposalUpdateInput): Promise<ProposalSnapshot | undefined> {
  if (!currentUser || !groupId) {
    return undefined;
  }

  const groupSelectionKey = APP_QUERY_KEYS.activity.groupSelectionById(groupId);

  await queryClient.cancelQueries({ queryKey: groupSelectionKey });

  const previousSelection =
    queryClient.getQueryData<ActivityGroupSelectionData>(groupSelectionKey);
  const existingProposal = findProposal(previousSelection, proposalId);

  if (!existingProposal) {
    return { groupId, previousSelection };
  }

  const planId = existingProposal.planId;
  const planProposalsKey = APP_QUERY_KEYS.activity.planProposals(planId);

  await queryClient.cancelQueries({ queryKey: planProposalsKey });

  const previousProposals =
    queryClient.getQueryData<PlanProposal[]>(planProposalsKey);
  const now = new Date().toISOString();

  updateSelectionProposal(
    queryClient,
    groupId,
    proposalId,
    currentUser,
    (proposal) => updateProposal(proposal, currentUser, now),
  );
  queryClient.setQueryData<PlanProposal[]>(
    planProposalsKey,
    (current) =>
      current?.map((proposal) =>
        proposal.id === proposalId
          ? updateProposal(proposal, currentUser, now)
          : proposal,
      ) ?? current,
  );

  return {
    groupId,
    planId,
    previousProposals,
    previousSelection,
  };
}

function addOptimisticVote(
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

function findProposal(
  selection: ActivityGroupSelectionData | undefined,
  proposalId: string,
) {
  return (
    selection?.group?.plan?.proposals?.find(
      (proposal) => proposal.id === proposalId,
    ) ??
    selection?.proposalMessages
      .map((message) => message.proposal)
      .find((proposal) => proposal?.id === proposalId)
  );
}

function updateSelectionProposal(
  queryClient: ReturnType<typeof useQueryClient>,
  groupId: string,
  proposalId: string,
  currentUser: User,
  updateProposal: (proposal: PlanProposal) => PlanProposal,
) {
  queryClient.setQueryData<ActivityGroupSelectionData>(
    APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        group: current.group
          ? {
              ...current.group,
              plan: current.group.plan
                ? {
                    ...current.group.plan,
                    proposals: current.group.plan.proposals?.map((proposal) =>
                      proposal.id === proposalId
                        ? updateProposal(proposal)
                        : proposal,
                    ),
                  }
                : current.group.plan,
            }
          : current.group,
        proposalMessages: current.proposalMessages.map((message) => {
          if (message.proposal?.id !== proposalId) {
            return message;
          }

          const nextProposal = updateProposal(message.proposal);
          const currentVote = nextProposal.votes.find(
            (vote) => vote.userId === currentUser.id,
          );

          return {
            ...message,
            hasVoted: Boolean(currentVote),
            proposal: nextProposal,
            proposalVoters: currentVote
              ? upsertProposalVoter(message.proposalVoters ?? [], currentUser, {
                  vote: currentVote.vote,
                })
              : message.proposalVoters,
            updatedAt: nextProposal.updatedAt,
            version: nextProposal.version,
          };
        }),
      };
    },
  );
}

function upsertProposalVoter(
  voters: NonNullable<
    ActivityGroupSelectionData["proposalMessages"][number]["proposalVoters"]
  >,
  user: User,
  vote: Pick<PlanProposal["votes"][number], "vote">,
) {
  return [
    ...voters.filter((item) => item.id !== user.id),
    {
      avatar: user.avatar,
      id: user.id,
      name: user.name,
      vote: vote.vote,
    },
  ];
}

function restoreProposalSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshot: ProposalSnapshot | undefined,
) {
  if (!snapshot?.groupId) {
    return;
  }

  queryClient.setQueryData(
    APP_QUERY_KEYS.activity.groupSelectionById(snapshot.groupId),
    snapshot.previousSelection,
  );

  if (snapshot.planId) {
    queryClient.setQueryData(
      APP_QUERY_KEYS.activity.planProposals(snapshot.planId),
      snapshot.previousProposals,
    );
  }
}

function writeConfirmedProposal(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshot: ProposalSnapshot | undefined,
  proposal: PlanProposal,
  currentUser: User | null,
) {
  if (!snapshot?.groupId) {
    return;
  }

  if (currentUser) {
    updateSelectionProposal(
      queryClient,
      snapshot.groupId,
      proposal.id,
      currentUser,
      () => proposal,
    );
  }

  queryClient.setQueryData<PlanProposal[]>(
    APP_QUERY_KEYS.activity.planProposals(proposal.planId),
    (current) =>
      current?.map((item) => (item.id === proposal.id ? proposal : item)) ??
      current,
  );
}
