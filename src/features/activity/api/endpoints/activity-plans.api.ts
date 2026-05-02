import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { planProposalSchema, planSchema } from "@/shared/schemas";

import {
  planProposalsSchema,
  updatePlanPayloadSchema,
  type CreatePlanProposalDto,
  type PlanMutationResult,
  type UpdatePlanPayload,
  type VotePlanProposalDto,
} from "@/features/activity/api/activity-api-contracts";

export async function updatePlan(
  planId: string,
  payload: UpdatePlanPayload,
): Promise<PlanMutationResult> {
  const response = await apiClient.patch(`plans/${planId}`, {
    json: updatePlanPayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) => planSchema.parse(value));
}

export async function getPlanProposals(planId: string) {
  const response = await apiClient
    .get(`plans/${planId}/proposals`)
    .json<unknown>();

  return planProposalsSchema.parse(response);
}

export async function createPlanProposal(
  planId: string,
  payload: CreatePlanProposalDto,
) {
  const response = await apiClient
    .post(`plans/${planId}/proposals`, {
      json: payload,
    })
    .json<unknown>();

  return planProposalSchema.parse(response);
}

export async function votePlanProposal(
  proposalId: string,
  payload: VotePlanProposalDto,
) {
  const response = await apiClient
    .post(`proposals/${proposalId}/vote`, {
      json: payload,
    })
    .json<unknown>();

  return planProposalSchema.parse(response);
}

export async function withdrawPlanProposal(proposalId: string) {
  const response = await apiClient
    .delete(`proposals/${proposalId}`)
    .json<unknown>();

  return planProposalSchema.parse(response);
}
