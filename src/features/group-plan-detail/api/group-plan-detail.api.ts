import { z } from "zod";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  exploreJoinRequestCancelResultSchema,
  exploreJoinResultSchema,
  groupApiSchema,
  inviteSchema,
  planProposalFieldSchema,
  planProposalSchema,
} from "@/shared/schemas";

import { groupPlanDetailSchema } from "../schemas/group-plan-detail.schema";

export const createGroupPlanProposalPayloadSchema = z.object({
  field: planProposalFieldSchema,
  proposedValue: z.string().trim().min(1),
});

export const voteGroupPlanProposalPayloadSchema = z.object({
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
    const response = await apiClient.post(`explore/groups/${groupId}/join`);

    return parseJsonWithRequestId(response, (value) =>
      exploreJoinResultSchema.parse(value),
    );
  }

  static async cancelJoinRequest(groupId: string) {
    const response = await apiClient.post(
      `explore/groups/${groupId}/cancel-request`,
    );

    return parseJsonWithRequestId(response, (value) =>
      exploreJoinRequestCancelResultSchema.parse(value),
    );
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
