import { z } from "zod";

export const reputationSummarySchema = z.object({
  displayScore: z.number().min(0).max(100).nullable(),
  evidenceState: z.enum(["NEW", "LIMITED", "ESTABLISHED"]),
  eligiblePlanCount: z.number().int().nonnegative(),
  distinctCounterpartyCount: z.number().int().nonnegative(),
  calculationVersion: z.string(),
  evidenceThrough: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
  hasOpenCorrection: z.boolean(),
});

export type ReputationSummary = z.infer<typeof reputationSummarySchema>;
