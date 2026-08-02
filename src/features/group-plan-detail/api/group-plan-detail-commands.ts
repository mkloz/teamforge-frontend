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
import type { PlanAccommodationStatus } from "../schemas/plan-accommodation.schema";
import type { PlanCommitmentResponse } from "../schemas/plan-commitment.schema";

async function invalidateGroupPlanDetail(groupId: string) {
  await appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.byId(groupId),
  });
}

async function invalidateAccommodationRequests(planId: string) {
  await appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.accommodationRequests(planId),
  });
}

export const GroupPlanDetailCommands = {
  async createAccommodationRequest(input: {
    escalationResponderId?: string;
    functionalRequirement: string;
    planId: string;
    responderId: string;
    responseDueAt: string;
  }) {
    const result = await GroupPlanDetailApi.createAccommodationRequest(
      input.planId,
      input,
    );
    await invalidateAccommodationRequests(input.planId);
    return result;
  },

  async respondAccommodationRequest(input: {
    planId: string;
    requestId: string;
    responseMessage?: string;
    status: PlanAccommodationStatus;
  }) {
    const result = await GroupPlanDetailApi.respondAccommodationRequest(
      input.planId,
      input.requestId,
      input,
    );
    await invalidateAccommodationRequests(input.planId);
    return result;
  },

  async clarifyAccommodationRequest(input: {
    functionalRequirement: string;
    planId: string;
    requestId: string;
  }) {
    const result = await GroupPlanDetailApi.clarifyAccommodationRequest(
      input.planId,
      input.requestId,
      input.functionalRequirement,
    );
    await invalidateAccommodationRequests(input.planId);
    return result;
  },

  async runAccommodationAction(input: {
    action: "cancel" | "escalate";
    planId: string;
    requestId: string;
  }) {
    const result = await GroupPlanDetailApi.runAccommodationAction(
      input.planId,
      input.requestId,
      input.action,
    );
    await invalidateAccommodationRequests(input.planId);
    return result;
  },

  async setCommitment(input: {
    expectedMaterialRevision: number;
    groupId: string;
    planId: string;
    response: PlanCommitmentResponse;
    reason?: string;
  }) {
    const result = await GroupPlanDetailApi.setCommitment(
      input.planId,
      {
        expectedMaterialRevision: input.expectedMaterialRevision,
        response: input.response,
        reason: input.reason,
      },
      crypto.randomUUID(),
    );

    await Promise.all([
      invalidateGroupPlanDetail(input.groupId),
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.groupPlanDetail.commitmentReadiness(
          input.planId,
        ),
      }),
    ]);

    return result;
  },

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

  async cancelInvite(groupId: string, planId: string, inviteId: string) {
    const result = await GroupPlanDetailApi.cancelInvite(inviteId);

    await Promise.all([
      invalidateGroupPlanDetail(groupId),
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.groupPlanDetail.inviteSuggestions(
          groupId,
          planId,
        ),
      }),
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
