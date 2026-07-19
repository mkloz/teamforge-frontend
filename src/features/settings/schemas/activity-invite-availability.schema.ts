import { z } from "zod";

export const ACTIVITY_INVITE_AVAILABILITY_POLICY_VERSION =
  "activity-invite-availability-v1" as const;

export const activityInviteAvailabilityLifecycleSchema = z.enum([
  "OPEN",
  "PAUSED",
  "EXPIRED",
  "RESTRICTED",
]);

export const activityInviteAvailabilitySchema = z.object({
  lifecycle: activityInviteAvailabilityLifecycleSchema.nullable(),
  localEnabled: z.boolean(),
  onlineEnabled: z.boolean(),
  availableUntil: z.string().datetime().nullable(),
  reconfirmedAt: z.string().datetime().nullable(),
  canAppearInLocalSuggestions: z.boolean(),
  canAppearInOnlineSuggestions: z.boolean(),
  policyVersion: z.string().min(1),
  revision: z.number().int().nonnegative(),
});

export const updateActivityInviteAvailabilitySchema = z
  .object({
    localEnabled: z.boolean(),
    onlineEnabled: z.boolean(),
    policyVersion: z.literal(ACTIVITY_INVITE_AVAILABILITY_POLICY_VERSION),
    expectedRevision: z.number().int().positive().nullable(),
  })
  .refine((value) => value.localEnabled || value.onlineEnabled, {
    message: "Choose local invitations, online invitations, or both.",
  });

export const activityInviteAvailabilityCommandSchema = z.object({
  policyVersion: z.literal(ACTIVITY_INVITE_AVAILABILITY_POLICY_VERSION),
  expectedRevision: z.number().int().positive(),
});

export type ActivityInviteAvailability = z.infer<
  typeof activityInviteAvailabilitySchema
>;
export type UpdateActivityInviteAvailability = z.infer<
  typeof updateActivityInviteAvailabilitySchema
>;
