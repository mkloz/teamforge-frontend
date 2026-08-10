import { z } from "zod";

const groupProposalAvailabilityLifecycleSchema = z.enum([
  "OPEN",
  "PAUSED",
  "EXPIRED",
  "RESTRICTED",
]);

export const groupProposalAvailabilitySchema = z.object({
  lifecycle: groupProposalAvailabilityLifecycleSchema.nullable(),
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
});

export const updateGroupProposalAvailabilitySchema = z
  .object({
    expectedRevision: z.number().int().positive().nullable(),
    localEnabled: z.boolean(),
    onlineEnabled: z.boolean(),
    policyVersion: z.string().min(1),
  })
  .refine((value) => value.localEnabled || value.onlineEnabled, {
    message: "Choose local activities, online activities, or both.",
  });

export const groupProposalAvailabilityPolicySchema = z.object({
  expectedRevision: z.number().int().positive(),
  policyVersion: z.string().min(1),
});

export type GroupProposalAvailability = z.infer<
  typeof groupProposalAvailabilitySchema
>;
export type UpdateGroupProposalAvailability = z.infer<
  typeof updateGroupProposalAvailabilitySchema
>;
