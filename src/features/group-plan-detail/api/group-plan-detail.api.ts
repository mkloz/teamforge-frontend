import { z } from "zod";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  postExploreGroupJoin,
  postExploreGroupJoinRequestCancel,
} from "@/shared/api/group-membership-api";
import {
  groupApiSchema,
  inviteSchema,
  planProposalFieldSchema,
  planProposalSchema,
} from "@/shared/schemas";

import { groupPlanDetailSchema } from "../schemas/group-plan-detail.schema";

const createGroupPlanProposalPayloadSchema = z.object({
  field: planProposalFieldSchema,
  proposedValue: z.string().trim().min(1),
});

const voteGroupPlanProposalPayloadSchema = z.object({
  vote: z.enum(["APPROVE", "REJECT"]),
});

export type CreateGroupPlanProposalPayload = z.infer<
  typeof createGroupPlanProposalPayloadSchema
>;
export type VoteGroupPlanProposalPayload = z.infer<
  typeof voteGroupPlanProposalPayloadSchema
>;

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
    const response = await apiClient.post(`invites/${inviteId}/accept`);

    return parseJsonWithRequestId(response, (value) =>
      inviteSchema.parse(value),
    );
  }

  static async declineInvite(inviteId: string) {
    const response = await apiClient.post(`invites/${inviteId}/decline`);

    return parseJsonWithRequestId(response, (value) =>
      inviteSchema.parse(value),
    );
  }

  static async createPlanProposal(
    planId: string,
    payload: CreateGroupPlanProposalPayload,
  ) {
    const response = await apiClient.post(`plans/${planId}/proposals`, {
      json: createGroupPlanProposalPayloadSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      planProposalSchema.parse(value),
    );
  }

  static async votePlanProposal(
    proposalId: string,
    payload: VoteGroupPlanProposalPayload,
  ) {
    const response = await apiClient.post(`proposals/${proposalId}/vote`, {
      json: voteGroupPlanProposalPayloadSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      planProposalSchema.parse(value),
    );
  }

  static async withdrawPlanProposal(proposalId: string) {
    const response = await apiClient.delete(`proposals/${proposalId}`);

    return parseJsonWithRequestId(response, (value) =>
      planProposalSchema.parse(value),
    );
  }

  static async leaveGroup(groupId: string) {
    const response = await apiClient.post(`groups/${groupId}/leave`);

    return parseJsonWithRequestId(response, (value) =>
      groupApiSchema.parse(value),
    );
  }
}
