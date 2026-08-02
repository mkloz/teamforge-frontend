import { z } from "zod";

export const planCommitmentResponseSchema = z.enum([
  "GOING",
  "UNSURE",
  "CANNOT_ATTEND",
]);

export const planCommitmentEffectiveStatusSchema = z.enum([
  "GOING",
  "UNSURE",
  "CANNOT_ATTEND",
  "NEEDS_RECONFIRMATION",
  "NOT_RESPONDED",
]);

export const planCommitmentSchema = z.object({
  planId: z.string(),
  userId: z.string(),
  response: planCommitmentResponseSchema,
  effectiveStatus: planCommitmentEffectiveStatusSchema,
  acknowledgedMaterialRevision: z.number().int().positive(),
  rowVersion: z.number().int().positive(),
  updatedAt: z.string().datetime(),
});

export const planCommitmentReadinessSchema = z.object({
  planId: z.string(),
  materialRevision: z.number().int().positive(),
  eligibleMemberCount: z.number().int().nonnegative(),
  goingCount: z.number().int().nonnegative(),
  unsureCount: z.number().int().nonnegative(),
  cannotAttendCount: z.number().int().nonnegative(),
  needsReconfirmationCount: z.number().int().nonnegative(),
  notRespondedCount: z.number().int().nonnegative(),
  committedQuorum: z.object({
    current: z.number().int().nonnegative(),
    required: z.number().int().nonnegative(),
    met: z.boolean(),
  }),
  currentUserCommitment: planCommitmentSchema.nullable(),
});

export type PlanCommitmentResponse = z.infer<
  typeof planCommitmentResponseSchema
>;
export type PlanCommitmentReadiness = z.infer<
  typeof planCommitmentReadinessSchema
>;
