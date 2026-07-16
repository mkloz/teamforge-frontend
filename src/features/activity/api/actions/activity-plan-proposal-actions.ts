import {
  ActivityApi,
  type CreatePlanProposalDto,
  type VotePlanProposalDto,
} from "@/features/activity/api/activity.api";
import { invalidatePlanDecisionSurfaces } from "@/shared/api/query-invalidation";

export const ActivityPlanProposalActions = {
  async createPlanProposal(
    planId: string,
    payload: CreatePlanProposalDto,
    groupId: string,
  ) {
    const proposal = await ActivityApi.createPlanProposal(planId, payload);

    await invalidatePlanDecisionSurfaces({
      groupId,
      planId: proposal.planId,
    });

    return proposal;
  },

  async votePlanProposal(
    proposalId: string,
    payload: VotePlanProposalDto,
    groupId?: string,
  ) {
    const proposal = await ActivityApi.votePlanProposal(proposalId, payload);

    await invalidatePlanDecisionSurfaces({
      groupId,
      planId: proposal.planId,
    });

    return proposal;
  },

  async withdrawPlanProposal(proposalId: string, groupId?: string) {
    const proposal = await ActivityApi.withdrawPlanProposal(proposalId);

    await invalidatePlanDecisionSurfaces({
      groupId,
      planId: proposal.planId,
    });

    return proposal;
  },
};
