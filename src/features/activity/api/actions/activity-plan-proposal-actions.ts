import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import {
  ActivityApi,
  type CreatePlanProposalDto,
  type VotePlanProposalDto,
} from "@/features/activity/api/activity.api";

function getGroupSelectionQueryKey(groupId?: string) {
  return groupId
    ? APP_QUERY_KEYS.activity.groupSelectionById(groupId)
    : APP_QUERY_KEYS.activity.groupSelection;
}

export const ActivityPlanProposalActions = {
  async createPlanProposal(
    planId: string,
    payload: CreatePlanProposalDto,
    groupId: string,
  ) {
    const proposal = await ActivityApi.createPlanProposal(planId, payload);

    await appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    });

    return proposal;
  },

  async votePlanProposal(
    proposalId: string,
    payload: VotePlanProposalDto,
    groupId?: string,
  ) {
    const proposal = await ActivityApi.votePlanProposal(proposalId, payload);

    await appQueryClient.invalidateQueries({
      queryKey: getGroupSelectionQueryKey(groupId),
    });

    return proposal;
  },

  async withdrawPlanProposal(proposalId: string, groupId?: string) {
    const proposal = await ActivityApi.withdrawPlanProposal(proposalId);

    await appQueryClient.invalidateQueries({
      queryKey: getGroupSelectionQueryKey(groupId),
    });

    return proposal;
  },
};
