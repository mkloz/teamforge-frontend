import * as ChatEndpoints from "@/features/activity/api/endpoints/activity-chats.api";
import * as FriendshipEndpoints from "@/features/activity/api/endpoints/activity-friendships.api";
import * as GroupEndpoints from "@/features/activity/api/endpoints/activity-groups.api";
import * as InviteEndpoints from "@/features/activity/api/endpoints/activity-invites.api";
import * as PlanEndpoints from "@/features/activity/api/endpoints/activity-plans.api";
import * as RatingEndpoints from "@/features/activity/api/endpoints/activity-ratings.api";

export type {
  CreateGroupPlanPayload,
  CreatePlanProposalDto,
  SendMessagePayload,
  UpdateGroupPayload,
  UpdatePlanPayload,
  VotePlanProposalDto,
} from "@/features/activity/api/activity-api-contracts";

export const ActivityApi = {
  getGroups: GroupEndpoints.getGroups,
  getGroup: GroupEndpoints.getGroup,
  updateGroup: GroupEndpoints.updateActivityGroup,
  leaveGroup: GroupEndpoints.leaveActivityGroup,
  removeGroupMember: GroupEndpoints.removeGroupMember,
  disbandGroup: GroupEndpoints.disbandGroup,
  createNextGroupPlan: GroupEndpoints.createNextGroupPlan,
  ...ChatEndpoints,
  getFriendships: FriendshipEndpoints.getFriendships,
  blockUser: FriendshipEndpoints.blockActivityUser,
  unblockUser: FriendshipEndpoints.unblockActivityUser,
  updatePlan: PlanEndpoints.updateActivityPlan,
  confirmPlan: PlanEndpoints.confirmPlan,
  completePlan: PlanEndpoints.completePlan,
  cancelPlan: PlanEndpoints.cancelPlan,
  getPlanProposals: PlanEndpoints.getPlanProposals,
  createPlanProposal: PlanEndpoints.createActivityPlanProposal,
  votePlanProposal: PlanEndpoints.voteActivityPlanProposal,
  withdrawPlanProposal: PlanEndpoints.withdrawActivityPlanProposal,
  ...RatingEndpoints,
  createInvite: InviteEndpoints.createActivityInvite,
};
