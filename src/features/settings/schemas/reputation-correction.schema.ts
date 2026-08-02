import { z } from "zod";

export const reputationCorrectionFormSchema = z.object({
  inputId: z.string().min(1, "Choose the evidence you want reviewed."),
  reason: z
    .string()
    .trim()
    .min(10, "Tell us what looks wrong in at least 10 characters.")
    .max(1000, "Keep the correction request under 1,000 characters."),
});

export const reputationDisputeSchema = z.object({
  id: z.string(),
  status: z.enum(["OPEN", "REVIEWING", "ACCEPTED", "REJECTED"]),
  createdAt: z.string().datetime(),
  inputId: z.string().nullable(),
});

export const reputationEvidenceSchema = z.object({
  id: z.string(),
  evidenceType: z.enum([
    "FOLLOW_THROUGH",
    "ATTENDANCE",
    "ADJUSTMENT",
    "LEGACY_BASELINE",
  ]),
  status: z.enum(["VALID", "DISPUTED", "INVALID"]),
  occurredAt: z.string().datetime(),
  planId: z.string().nullable(),
  planTitle: z.string().nullable(),
});

export const reputationDisputeDetailSchema = reputationDisputeSchema.extend({
  updatedAt: z.string().datetime(),
  reason: z.string(),
  decision: z.string().nullable(),
  resolvedAt: z.string().datetime().nullable(),
});

export type ReputationCorrectionFormValues = z.infer<
  typeof reputationCorrectionFormSchema
>;
