import {
  type CreateGroupPlanProposalPayload,
  GroupPlanDetailApi,
  type VoteGroupPlanProposalPayload,
} from "@/features/group-plan-detail/api/group-plan-detail.api";
import { appQueryClient } from "@/shared/api/query-client";
import {
  invalidateGroupMembershipSurfaces,
  invalidateInvitationSurfaces,
  invalidateNotificationSurfaces,
  invalidatePlanDecisionSurfaces,
} from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

async function invalidateGroupPlanDetail(groupId: string) {
  await appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.byId(groupId),
  });
}

export const GroupPlanDetailCommands = {
  async inviteSuggestion(
    groupId: string,
    planId: string,
    suggestionId: string,
  ) {
    const result = await GroupPlanDetailApi.inviteSuggestion(
      groupId,
      suggestionId,
    );

    await Promise.all([
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.groupPlanDetail.inviteSuggestions(
          groupId,
          planId,
        ),
      }),
      invalidateGroupPlanDetail(groupId),
      invalidateInvitationSurfaces(),
      invalidateNotificationSurfaces(),
    ]);

    return result;
  },

  async joinGroup(groupId: string) {
    const result = await GroupPlanDetailApi.joinGroup(groupId);

    await Promise.all([
      invalidateGroupPlanDetail(groupId),
      invalidateGroupMembershipSurfaces(),
      invalidateNotificationSurfaces(),
    ]);

    return result;
  },

  async cancelJoinRequest(groupId: string) {
    const result = await GroupPlanDetailApi.cancelJoinRequest(groupId);

    await Promise.all([
      invalidateGroupPlanDetail(groupId),
      invalidateGroupMembershipSurfaces(),
      invalidateNotificationSurfaces(),
    ]);

    return result;
  },

  async acceptInvite(groupId: string, inviteId: string) {
    const result = await GroupPlanDetailApi.acceptInvite(inviteId);

    await Promise.all([
      invalidateGroupPlanDetail(groupId),
      invalidateGroupMembershipSurfaces(),
      invalidateInvitationSurfaces(),
      invalidateNotificationSurfaces(),
    ]);

    return result;
  },

  async declineInvite(groupId: string, inviteId: string) {
    const result = await GroupPlanDetailApi.declineInvite(inviteId);

    await Promise.all([
      invalidateGroupPlanDetail(groupId),
      invalidateInvitationSurfaces(),
      invalidateNotificationSurfaces(),
    ]);

    return result;
  },

  async createPlanProposal(
    groupId: string,
    planId: string,
    payload: CreateGroupPlanProposalPayload,
  ) {
    const result = await GroupPlanDetailApi.createPlanProposal(planId, payload);

    await invalidatePlanDecisionSurfaces({
      groupId,
      planId: result.data.planId,
    });

    return result;
  },

  async votePlanProposal(
    groupId: string,
    proposalId: string,
    payload: VoteGroupPlanProposalPayload,
  ) {
    const result = await GroupPlanDetailApi.votePlanProposal(
      proposalId,
      payload,
    );

    await invalidatePlanDecisionSurfaces({
      groupId,
      planId: result.data.planId,
    });

    return result;
  },

  async withdrawPlanProposal(groupId: string, proposalId: string) {
    const result = await GroupPlanDetailApi.withdrawPlanProposal(proposalId);

    await invalidatePlanDecisionSurfaces({
      groupId,
      planId: result.data.planId,
    });

    return result;
  },

  async leaveGroup(groupId: string) {
    const result = await GroupPlanDetailApi.leaveGroup(groupId);

    await Promise.all([
      invalidateGroupPlanDetail(groupId),
      invalidateGroupMembershipSurfaces(),
      invalidateNotificationSurfaces(),
    ]);

    return result;
  },
};
