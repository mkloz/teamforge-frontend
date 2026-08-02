import { z } from "zod";

export const reputationCorrectionFormSchema = z.object({
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

export type ReputationCorrectionFormValues = z.infer<
  typeof reputationCorrectionFormSchema
>;
