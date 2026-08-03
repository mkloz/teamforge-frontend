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
import type { PlanCommitmentResponse } from "../schemas/plan-commitment.schema";

async function invalidateGroupPlanDetail(groupId: string) {
  await appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.byId(groupId),
  });
}

async function invalidateSeatRecovery(planId: string) {
  await Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.seatRecovery(planId),
    }),
    invalidateOperationalState(planId),
  ]);
}

function invalidateOperationalState(planId: string) {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.operationalState(planId),
  });
}

export const GroupPlanDetailCommands = {
  async archiveGroup(groupId: string, expectedRevision: number) {
    const result = await GroupPlanDetailApi.archiveGroup(
      groupId,
      expectedRevision,
    );
    await invalidateGroupLifecycleSurfaces(groupId);
    return result;
  },

  async restoreGroup(groupId: string, expectedRevision: number) {
    const result = await GroupPlanDetailApi.restoreGroup(
      groupId,
      expectedRevision,
    );
    await invalidateGroupLifecycleSurfaces(groupId);
    return result;
  },

  async createExternalInvite(planId: string) {
    const result = await GroupPlanDetailApi.createExternalInvite(planId);
    await invalidateExternalInvites(planId);
    return result;
  },

  async revokeExternalInvite(planId: string, inviteId: string) {
    await GroupPlanDetailApi.revokeExternalInvite(inviteId);
    await invalidateExternalInvites(planId);
  },

  async createGuestMembershipProposal(groupId: string, planGuestId: string) {
    const result = await GroupPlanDetailApi.createGuestMembershipProposal(
      groupId,
      planGuestId,
    );
    await invalidateGuestMembership(groupId);
    return result;
  },

  async voteGuestMembershipProposal(
    groupId: string,
    proposalId: string,
    approve: boolean,
  ) {
    const result = await GroupPlanDetailApi.voteGuestMembershipProposal(
      proposalId,
      approve,
    );
    await Promise.all([
      invalidateGuestMembership(groupId),
      invalidateGroupPlanDetail(groupId),
    ]);
    return result;
  },

  async createOwnershipTransfer(groupId: string, recipientId: string) {
    const result = await GroupPlanDetailApi.createOwnershipTransfer(
      groupId,
      recipientId,
    );
    await invalidateOwnershipTransfer(groupId);
    return result;
  },

  async respondOwnershipTransfer(
    groupId: string,
    transferId: string,
    response: "accept" | "decline" | "cancel",
  ) {
    const result = await GroupPlanDetailApi.respondOwnershipTransfer(
      transferId,
      response,
    );
    await Promise.all([
      invalidateOwnershipTransfer(groupId),
      invalidateGroupPlanDetail(groupId),
      invalidateGroupMembershipSurfaces(),
    ]);
    return result;
  },

  async joinSeatWaitlist(planId: string) {
    const result = await GroupPlanDetailApi.joinSeatWaitlist(planId);
    await invalidateSeatRecovery(planId);
    return result;
  },

  async acceptSeatOffer(input: {
    expectedMaterialRevision: number;
    offerId: string;
    planId: string;
  }) {
    const result = await GroupPlanDetailApi.acceptSeatOffer(
      input.planId,
      input.offerId,
      input.expectedMaterialRevision,
    );
    await Promise.all([
      invalidateSeatRecovery(input.planId),
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.groupPlanDetail.all,
      }),
    ]);
    return result;
  },

  async declineSeatOffer(input: {
    doNotOfferAgain: boolean;
    offerId: string;
    planId: string;
  }) {
    const result = await GroupPlanDetailApi.declineSeatOffer(
      input.planId,
      input.offerId,
      input.doNotOfferAgain,
    );
    await invalidateSeatRecovery(input.planId);
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
      invalidateOperationalState(input.planId),
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

function invalidateGroupLifecycleSurfaces(groupId: string) {
  return Promise.all([
    invalidateGroupPlanDetail(groupId),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.lifecycle(groupId),
    }),
    invalidateGroupMembershipSurfaces(),
    invalidateNotificationSurfaces(),
  ]);
}

function invalidateExternalInvites(planId: string) {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.externalInvites(planId),
  });
}

function invalidateGuestMembership(groupId: string) {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.guestMembershipProposals(groupId),
  });
}

function invalidateOwnershipTransfer(groupId: string) {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.ownershipTransfer(groupId),
  });
}
