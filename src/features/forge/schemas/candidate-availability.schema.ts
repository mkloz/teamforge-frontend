import { z } from "zod";

const candidateAvailabilityLifecycleSchema = z.enum([
  "OPEN",
  "PAUSED",
  "EXPIRED",
  "RESTRICTED",
]);

export const candidateAvailabilitySchema = z.object({
  lifecycle: candidateAvailabilityLifecycleSchema.nullable(),
  localEnabled: z.boolean(),
  onlineEnabled: z.boolean(),
  availableUntil: z.string().datetime().nullable(),
  reconfirmedAt: z.string().datetime().nullable(),
  proposalCooldownUntil: z.string().datetime().nullable(),
  reservedSeatCount: z.number().int().min(0).max(1).nullable(),
  liveAutomaticGroupCount: z.number().int().min(0).max(1).nullable(),
  canReceiveLocalProposals: z.boolean(),
  canReceiveOnlineProposals: z.boolean(),
  policyVersion: z.string().min(1),
  revision: z.number().int().nonnegative(),
  legacyAvailabilityPrompt: z.boolean(),
});

export const updateCandidateAvailabilitySchema = z
  .object({
    expectedRevision: z.number().int().positive().nullable(),
    localEnabled: z.boolean(),
    onlineEnabled: z.boolean(),
    policyVersion: z.string().min(1),
  })
  .refine((value) => value.localEnabled || value.onlineEnabled, {
    message: "Choose local activities, online activities, or both.",
  });

export const candidateAvailabilityPolicySchema = z.object({
  expectedRevision: z.number().int().positive(),
  policyVersion: z.string().min(1),
});

export type CandidateAvailability = z.infer<typeof candidateAvailabilitySchema>;
export type UpdateCandidateAvailability = z.infer<
  typeof updateCandidateAvailabilitySchema
>;
