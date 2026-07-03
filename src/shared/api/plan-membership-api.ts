import { z } from "zod";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  planProposalFieldSchema,
  planProposalSchema,
  planSchema,
} from "@/shared/schemas";
import { managedAssetReferenceSchema } from "@/shared/validators/url.validator";

const updatePlanCoverImagePayloadSchema = z.object({
  coverImage: managedAssetReferenceSchema.nullable().optional(),
});

const createPlanProposalPayloadSchema = z.object({
  field: planProposalFieldSchema,
  proposedValue: z.string().trim().min(1),
});

const votePlanProposalPayloadSchema = z.object({
  vote: z.enum(["APPROVE", "REJECT"]),
});

export type CreatePlanProposalPayload = z.infer<
  typeof createPlanProposalPayloadSchema
>;
export type VotePlanProposalPayload = z.infer<
  typeof votePlanProposalPayloadSchema
>;

export async function updatePlan(planId: string, payload: unknown) {
  const response = await apiClient.patch(`plans/${planId}`, {
    json: payload,
  });

  return parseJsonWithRequestId(response, (value) => planSchema.parse(value));
}

export function updatePlanCoverImage(planId: string, payload: unknown) {
  return updatePlan(planId, updatePlanCoverImagePayloadSchema.parse(payload));
}

export async function createPlanProposal(
  planId: string,
  payload: CreatePlanProposalPayload,
) {
  const response = await apiClient.post(`plans/${planId}/proposals`, {
    json: createPlanProposalPayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) =>
    planProposalSchema.parse(value),
  );
}

export async function votePlanProposal(
  proposalId: string,
  payload: VotePlanProposalPayload,
) {
  const response = await apiClient.post(`proposals/${proposalId}/vote`, {
    json: votePlanProposalPayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) =>
    planProposalSchema.parse(value),
  );
}

export async function withdrawPlanProposal(proposalId: string) {
  const response = await apiClient.delete(`proposals/${proposalId}`);

  return parseJsonWithRequestId(response, (value) =>
    planProposalSchema.parse(value),
  );
}
