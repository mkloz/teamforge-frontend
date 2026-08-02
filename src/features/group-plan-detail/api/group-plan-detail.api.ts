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

import { groupPlanDetailSchema } from "../schemas/group-plan-detail.schema";
import {
  type PlanAccommodationStatus,
  planAccommodationRequestSchema,
  planAccommodationRequestsSchema,
} from "../schemas/plan-accommodation.schema";
import {
  type PlanCommitmentResponse,
  planCommitmentReadinessSchema,
  planCommitmentSchema,
} from "../schemas/plan-commitment.schema";

export type CreateGroupPlanProposalPayload = CreatePlanProposalPayload;
export type VoteGroupPlanProposalPayload = VotePlanProposalPayload;

export class GroupPlanDetailApi {
  static async getDetail(groupId: string) {
    const response = await apiClient
      .get(`groups/${groupId}/detail`)
      .json<unknown>();

    return groupPlanDetailSchema.parse(response);
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

  static async getAccommodationRequests(planId: string) {
    const response = await apiClient
      .get(`plans/${planId}/accommodation-requests`)
      .json<unknown>();
    return planAccommodationRequestsSchema.parse(response);
  }

  static async createAccommodationRequest(
    planId: string,
    payload: {
      escalationResponderId?: string;
      functionalRequirement: string;
      responderId: string;
      responseDueAt: string;
    },
  ) {
    const response = await apiClient
      .post(`plans/${planId}/accommodation-requests`, { json: payload })
      .json<unknown>();
    return planAccommodationRequestSchema.parse(response);
  }

  static async respondAccommodationRequest(
    planId: string,
    requestId: string,
    payload: { responseMessage?: string; status: PlanAccommodationStatus },
  ) {
    const response = await apiClient
      .post(`plans/${planId}/accommodation-requests/${requestId}/response`, {
        json: payload,
      })
      .json<unknown>();
    return planAccommodationRequestSchema.parse(response);
  }

  static async clarifyAccommodationRequest(
    planId: string,
    requestId: string,
    functionalRequirement: string,
  ) {
    const response = await apiClient
      .post(
        `plans/${planId}/accommodation-requests/${requestId}/clarification`,
        { json: { functionalRequirement } },
      )
      .json<unknown>();
    return planAccommodationRequestSchema.parse(response);
  }

  static async runAccommodationAction(
    planId: string,
    requestId: string,
    action: "cancel" | "escalate",
  ) {
    const response = await apiClient
      .post(`plans/${planId}/accommodation-requests/${requestId}/${action}`)
      .json<unknown>();
    return planAccommodationRequestSchema.parse(response);
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
