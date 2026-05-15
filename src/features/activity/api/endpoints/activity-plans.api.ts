import {
  type CreatePlanProposalDto,
  createPlanProposalPayloadSchema,
  type PlanMutationResult,
  planProposalsSchema,
  type UpdatePlanPayload,
  updatePlanPayloadSchema,
  type VotePlanProposalDto,
} from "@/features/activity/api/activity-api-contracts";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { planProposalSchema, planSchema } from "@/shared/schemas";

export async function updatePlan(
  planId: string,
  payload: UpdatePlanPayload,
): Promise<PlanMutationResult> {
  const response = await apiClient.patch(`plans/${planId}`, {
    json: updatePlanPayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) => planSchema.parse(value));
}

export async function confirmPlan(planId: string): Promise<PlanMutationResult> {
  const response = await apiClient.post(`plans/${planId}/confirm`);

  return parseJsonWithRequestId(response, (value) => planSchema.parse(value));
}

export async function completePlan(
  planId: string,
): Promise<PlanMutationResult> {
  const response = await apiClient.post(`plans/${planId}/complete`);

  return parseJsonWithRequestId(response, (value) => planSchema.parse(value));
}

export async function cancelPlan(planId: string): Promise<PlanMutationResult> {
  const response = await apiClient.post(`plans/${planId}/cancel`);

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
      json: createPlanProposalPayloadSchema.parse(payload),
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
