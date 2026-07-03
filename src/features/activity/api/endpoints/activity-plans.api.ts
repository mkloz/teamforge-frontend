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
import {
  createPlanProposal as sharedCreatePlanProposal,
  updatePlan as sharedUpdatePlan,
  votePlanProposal as sharedVotePlanProposal,
  withdrawPlanProposal as sharedWithdrawPlanProposal,
} from "@/shared/api/plan-membership-api";
import { planSchema } from "@/shared/schemas";

export async function updateActivityPlan(
  planId: string,
  payload: UpdatePlanPayload,
): Promise<PlanMutationResult> {
  return sharedUpdatePlan(planId, updatePlanPayloadSchema.parse(payload));
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

export async function createActivityPlanProposal(
  planId: string,
  payload: CreatePlanProposalDto,
) {
  const result = await sharedCreatePlanProposal(
    planId,
    createPlanProposalPayloadSchema.parse(payload),
  );

  return result.data;
}

export async function voteActivityPlanProposal(
  proposalId: string,
  payload: VotePlanProposalDto,
) {
  const result = await sharedVotePlanProposal(proposalId, payload);

  return result.data;
}

export async function withdrawActivityPlanProposal(proposalId: string) {
  const result = await sharedWithdrawPlanProposal(proposalId);

  return result.data;
}
