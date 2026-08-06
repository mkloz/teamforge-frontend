import { groupInviteSuggestionsSchema } from "@/features/group-plan-detail/schemas/group-invite-suggestion.schema";
import { apiClient } from "@/shared/api/api";
import {
  postExploreGroupJoin,
  postExploreGroupJoinRequestCancel,
  leaveGroup as sharedLeaveGroup,
} from "@/shared/api/group-membership-api";
import {
  acceptInvite as sharedAcceptInvite,
  cancelInvite as sharedCancelInvite,
  createInvite as sharedCreateInvite,
  declineInvite as sharedDeclineInvite,
} from "@/shared/api/invite-membership-api";
import {
  type CreatePlanProposalPayload,
  createPlanProposal as sharedCreatePlanProposal,
  votePlanProposal as sharedVotePlanProposal,
  withdrawPlanProposal as sharedWithdrawPlanProposal,
  type VotePlanProposalPayload,
} from "@/shared/api/plan-membership-api";
import { planOperationalStateSchema } from "@/shared/schemas/plan-operational-state";
import { groupLifecycleSchema } from "../schemas/group-lifecycle.schema";
import { groupPlanDetailResponseSchema } from "../schemas/group-plan-detail.schema";
import {
  type PlanCommitmentResponse,
  planCommitmentReadinessSchema,
  planCommitmentSchema,
} from "../schemas/plan-commitment.schema";
import {
  createdExternalInviteSchema,
  externalInviteClaimSchema,
  externalInviteListItemSchema,
  externalInvitePreviewSchema,
  guestMembershipProposalSchema,
  ownershipTransferSchema,
  planGuestAccessSchema,
  planGuestSummarySchema,
} from "../schemas/plan-participant-management.schema";
import {
  planSeatViewerStateSchema,
  seatOfferResponseSchema,
} from "../schemas/plan-seat-recovery.schema";

export type CreateGroupPlanProposalPayload = CreatePlanProposalPayload;
export type VoteGroupPlanProposalPayload = VotePlanProposalPayload;

export class GroupPlanDetailApi {
  static async getLifecycle(groupId: string) {
    const response = await apiClient
      .get(`groups/${groupId}/lifecycle`)
      .json<unknown>();
    return groupLifecycleSchema.parse(response);
  }

  static async archiveGroup(groupId: string, expectedRevision: number) {
    const response = await apiClient
      .post(`groups/${groupId}/archive`, {
        headers: { "Idempotency-Key": crypto.randomUUID() },
        json: { expectedRevision },
      })
      .json<unknown>();
    return groupLifecycleSchema.parse(response);
  }

  static async restoreGroup(groupId: string, expectedRevision: number) {
    const response = await apiClient
      .post(`groups/${groupId}/restore`, {
        headers: { "Idempotency-Key": crypto.randomUUID() },
        json: { expectedRevision },
      })
      .json<unknown>();
    return groupLifecycleSchema.parse(response);
  }

  static async getDetail(groupId: string) {
    const response = await apiClient
      .get(`groups/${groupId}/detail`)
      .json<unknown>();

    return groupPlanDetailResponseSchema.parse(response);
  }

  static async getInviteSuggestions(groupId: string) {
    const response = await apiClient
      .get(`groups/${groupId}/invite-suggestions`)
      .json<unknown>();

    return groupInviteSuggestionsSchema.parse(response);
  }

  static async getCommitmentReadiness(planId: string) {
    const response = await apiClient
      .get(`plans/${planId}/readiness`)
      .json<unknown>();

    return planCommitmentReadinessSchema.parse(response);
  }

  static async getOperationalState(planId: string) {
    const response = await apiClient
      .get(`plans/${planId}/operational-state`)
      .json<unknown>();

    return planOperationalStateSchema.parse(response);
  }

  static async setCommitment(
    planId: string,
    payload: {
      expectedMaterialRevision: number;
      response: PlanCommitmentResponse;
      reason?: string;
    },
    idempotencyKey: string,
  ) {
    const response = await apiClient
      .put(`plans/${planId}/commitment`, {
        headers: { "Idempotency-Key": idempotencyKey },
        json: payload,
      })
      .json<unknown>();

    return planCommitmentSchema.parse(response);
  }

  static async getSeatRecovery(planId: string) {
    const response = await apiClient
      .get(`plans/${planId}/seat-recovery`)
      .json<unknown>();
    return planSeatViewerStateSchema.parse(response);
  }

  static async joinSeatWaitlist(planId: string) {
    const response = await apiClient
      .post(`plans/${planId}/seat-recovery/waitlist`)
      .json<unknown>();
    return seatOfferResponseSchema.parse(response);
  }

  static async acceptSeatOffer(
    planId: string,
    offerId: string,
    expectedMaterialRevision: number,
  ) {
    const response = await apiClient
      .post(`plans/${planId}/seat-offers/${offerId}/accept`, {
        json: {
          acknowledgePlanParticipation: true,
          expectedMaterialRevision,
        },
      })
      .json<unknown>();
    return seatOfferResponseSchema.parse(response);
  }

  static async declineSeatOffer(
    planId: string,
    offerId: string,
    doNotOfferAgain: boolean,
  ) {
    const response = await apiClient
      .post(`plans/${planId}/seat-offers/${offerId}/decline`, {
        json: { doNotOfferAgain },
      })
      .json<unknown>();
    return seatOfferResponseSchema.parse(response);
  }

  static async exchangeExternalInvite(token: string) {
    const response = await apiClient
      .post("external-invites/exchange", {
        context: { auth: "none", retryOnUnauthorized: false },
        json: { token },
      })
      .json<unknown>();
    return externalInvitePreviewSchema.parse(response);
  }

  static async getExternalInvitePreview() {
    const response = await apiClient
      .get("external-invites/preview", {
        context: { auth: "none", retryOnUnauthorized: false },
      })
      .json<unknown>();
    return externalInvitePreviewSchema.parse(response);
  }

  static async claimExternalInvite() {
    const response = await apiClient
      .post("external-invites/claim")
      .json<unknown>();
    return externalInviteClaimSchema.parse(response);
  }

  static suppressExternalInvite(report: boolean) {
    return apiClient
      .post("external-invites/suppress", {
        context: { auth: "none", retryOnUnauthorized: false },
        json: { report },
      })
      .then(() => undefined);
  }

  static async createExternalInvite(planId: string) {
    const response = await apiClient
      .post(`plans/${planId}/external-invites`, {
        json: { expiresInHours: 72 },
      })
      .json<unknown>();
    return createdExternalInviteSchema.parse(response);
  }

  static async listExternalInvites(planId: string) {
    const response = await apiClient
      .get(`plans/${planId}/external-invites`)
      .json<unknown>();
    return externalInviteListItemSchema.array().parse(response);
  }

  static revokeExternalInvite(inviteId: string) {
    return apiClient
      .post(`external-invites/${inviteId}/revoke`)
      .then(() => undefined);
  }

  static async getPlanGuestAccess(planId: string) {
    const response = await apiClient
      .get(`plans/${planId}/guest-access`)
      .json<unknown>();
    return planGuestAccessSchema.parse(response);
  }

  static withdrawPlanGuest(planId: string) {
    return apiClient
      .post(`plans/${planId}/guest-access/withdraw`)
      .then(() => undefined);
  }

  static async listPlanGuests(planId: string) {
    const response = await apiClient
      .get(`plans/${planId}/guests`)
      .json<unknown>();
    return planGuestSummarySchema.array().parse(response);
  }

  static async listGuestMembershipProposals(groupId: string) {
    const response = await apiClient
      .get(`groups/${groupId}/guest-membership-proposals`)
      .json<unknown>();
    return guestMembershipProposalSchema.array().parse(response);
  }

  static async getGuestMembershipProposal(planId: string) {
    const response = await apiClient
      .get(`groups/guest-membership-proposals/for-plan/${planId}`)
      .json<unknown>();
    return guestMembershipProposalSchema.nullable().parse(response);
  }

  static async createGuestMembershipProposal(
    groupId: string,
    planGuestId: string,
  ) {
    const response = await apiClient
      .post(`groups/${groupId}/guest-membership-proposals`, {
        json: { planGuestId },
      })
      .json<unknown>();
    return guestMembershipProposalSchema.parse(response);
  }

  static async respondGuestMembershipProposal(
    proposalId: string,
    accept: boolean,
  ) {
    const response = await apiClient
      .post(`groups/guest-membership-proposals/${proposalId}/respond`, {
        json: { accept },
      })
      .json<unknown>();
    return guestMembershipProposalSchema.parse(response);
  }

  static async voteGuestMembershipProposal(
    proposalId: string,
    approve: boolean,
  ) {
    const response = await apiClient
      .post(`groups/guest-membership-proposals/${proposalId}/vote`, {
        json: { approve },
      })
      .json<unknown>();
    return guestMembershipProposalSchema.parse(response);
  }

  static async getOwnershipTransfer(groupId: string) {
    const response = await apiClient
      .get(`groups/${groupId}/ownership-transfer`)
      .json<unknown>();
    return ownershipTransferSchema.parse(response);
  }

  static async createOwnershipTransfer(groupId: string, recipientId: string) {
    const response = await apiClient
      .post(`groups/${groupId}/ownership-transfer`, {
        headers: { "Idempotency-Key": crypto.randomUUID() },
        json: { recipientId },
      })
      .json<unknown>();
    return ownershipTransferSchema.unwrap().parse(response);
  }

  static async respondOwnershipTransfer(
    transferId: string,
    response: "accept" | "decline" | "cancel",
  ) {
    const payload = await apiClient
      .post(`groups/ownership-transfers/${transferId}/${response}`, {
        headers: { "Idempotency-Key": crypto.randomUUID() },
      })
      .json<unknown>();
    return ownershipTransferSchema.unwrap().parse(payload);
  }

  static async inviteSuggestion(groupId: string, suggestionId: string) {
    return sharedCreateInvite({
      groupId,
      suggestionId,
      type: "DIRECT_INVITE",
    });
  }

  static async joinGroup(groupId: string) {
    return postExploreGroupJoin(groupId);
  }

  static async cancelJoinRequest(groupId: string) {
    return postExploreGroupJoinRequestCancel(groupId);
  }

  static async acceptInvite(inviteId: string) {
    return sharedAcceptInvite(inviteId);
  }

  static async declineInvite(inviteId: string) {
    return sharedDeclineInvite(inviteId);
  }

  static async cancelInvite(inviteId: string) {
    return sharedCancelInvite(inviteId);
  }

  static async createPlanProposal(
    planId: string,
    payload: CreateGroupPlanProposalPayload,
  ) {
    return sharedCreatePlanProposal(planId, payload);
  }

  static async votePlanProposal(
    proposalId: string,
    payload: VoteGroupPlanProposalPayload,
  ) {
    return sharedVotePlanProposal(proposalId, payload);
  }

  static async withdrawPlanProposal(proposalId: string) {
    return sharedWithdrawPlanProposal(proposalId);
  }

  static async leaveGroup(groupId: string) {
    return sharedLeaveGroup(groupId);
  }
}
