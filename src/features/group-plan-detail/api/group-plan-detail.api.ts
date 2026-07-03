import { apiClient } from "@/shared/api/api";
import {
  postExploreGroupJoin,
  postExploreGroupJoinRequestCancel,
  leaveGroup as sharedLeaveGroup,
} from "@/shared/api/group-membership-api";
import {
  acceptInvite as sharedAcceptInvite,
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

export type CreateGroupPlanProposalPayload = CreatePlanProposalPayload;
export type VoteGroupPlanProposalPayload = VotePlanProposalPayload;

export class GroupPlanDetailApi {
  static async getDetail(groupId: string) {
    const response = await apiClient
      .get(`groups/${groupId}/detail`)
      .json<unknown>();

    return groupPlanDetailSchema.parse(response);
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
