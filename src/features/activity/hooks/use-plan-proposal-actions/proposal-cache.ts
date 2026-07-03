import type { QueryClient } from "@tanstack/react-query";
import type { ActivityGroupSelectionData } from "@/features/activity/api/activity-query-data";
import { updateSelectionProposal } from "@/features/activity/hooks/use-plan-proposal-actions/proposal-selection-updates";
import type {
  ApplyOptimisticProposalUpdateInput,
  ProposalSnapshot,
} from "@/features/activity/hooks/use-plan-proposal-actions/types";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { PlanProposal, User } from "@/shared/schemas";

export async function applyOptimisticProposalUpdate({
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

export function restoreProposalSnapshot(
  queryClient: QueryClient,
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

export function writeConfirmedProposal(
  queryClient: QueryClient,
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
