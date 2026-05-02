import type { CreateRatingPayload } from "@/shared/schemas";

import { ActivityActions } from "@/features/activity/api/activity-actions";
import type {
  CreatePlanProposalDto,
  VotePlanProposalDto,
} from "@/features/activity/api/activity.api";

export const ActivityPlanRatingCommands = {
  createPlanProposal(
    planId: string,
    payload: CreatePlanProposalDto,
    groupId: string,
  ) {
    return ActivityActions.createPlanProposal(planId, payload, groupId);
  },

  votePlanProposal(
    proposalId: string,
    payload: VotePlanProposalDto,
    groupId?: string,
  ) {
    return ActivityActions.votePlanProposal(proposalId, payload, groupId);
  },

  withdrawPlanProposal(proposalId: string, groupId?: string) {
    return ActivityActions.withdrawPlanProposal(proposalId, groupId);
  },

  createGroupRating(groupId: string, payload: CreateRatingPayload) {
    return ActivityActions.createGroupRating(groupId, payload);
  },
};
