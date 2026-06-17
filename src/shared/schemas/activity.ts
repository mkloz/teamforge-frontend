import { z } from "zod";
import {
  managedAssetReferenceSchema,
  managedUploadUrlSchema,
} from "@/shared/validators/url.validator";
import {
  activityAccessSchema,
  activityStatusSchema,
  activityVisibilitySchema,
  costTypeSchema,
  forgeModeSchema,
  groupRoleSchema,
  groupStatusSchema,
  locationModeSchema,
  planCategorySchema,
  planStatusSchema,
} from "./enums";

export type { Activity } from "./activity-group-plan";
export { activitySchema } from "./activity-group-plan";

export const createActivityInputSchema = z
  .object({
    title: z.string().trim().min(1).max(140),
    description: z.string().trim().min(1).max(1000).nullable().optional(),
    city: z.string().trim().min(1).max(100).nullable().optional(),
    locationLat: z.number().finite().min(-90).max(90).optional(),
    locationLng: z.number().finite().min(-180).max(180).optional(),
    visibility: activityVisibilitySchema,
    access: activityAccessSchema,
    forgeMode: forgeModeSchema,
    interestIds: z.array(z.string().trim().min(1)).min(1).max(20),
  })
  .strict()
  .superRefine((input, ctx) => {
    const hasLat = input.locationLat !== undefined;
    const hasLng = input.locationLng !== undefined;

    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: "custom",
        message: "Provide both latitude and longitude.",
        path: hasLat ? ["locationLng"] : ["locationLat"],
      });
    }
  });

export type CreateActivityInput = z.infer<typeof createActivityInputSchema>;

export const forgePlanInputSchema = z
  .object({
    title: z.string().trim().min(1).max(140),
    description: z.string().trim().min(1).max(1000).nullable().optional(),
    coverImage: managedAssetReferenceSchema.nullable().optional(),
    category: planCategorySchema,
    dateTime: z.string().datetime(),
    locationMode: locationModeSchema,
    location: z.string().trim().min(1).max(200).nullable().optional(),
    locationLat: z.number().finite().min(-90).max(90).optional(),
    locationLng: z.number().finite().min(-180).max(180).optional(),
    cost: costTypeSchema,
    costAmount: z.number().finite().positive().nullable().optional(),
    costDetails: z.string().trim().min(1).max(250).nullable().optional(),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (new Date(input.dateTime).getTime() <= Date.now()) {
      ctx.addIssue({
        code: "custom",
        message: "Plan date-time must be in the future.",
        path: ["dateTime"],
      });
    }

    if (
      (input.locationMode === "IN_PERSON" || input.locationMode === "ONLINE") &&
      !input.location
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Location is required for in-person and online plans.",
        path: ["location"],
      });
    }

    if (input.locationMode === "TBD" && input.location) {
      ctx.addIssue({
        code: "custom",
        message: "Location must be omitted when location mode is TBD.",
        path: ["location"],
      });
    }

    const hasLat = input.locationLat !== undefined;
    const hasLng = input.locationLng !== undefined;

    if (input.locationMode !== "IN_PERSON" && (hasLat || hasLng)) {
      ctx.addIssue({
        code: "custom",
        message: "Coordinates are only accepted for in-person plans.",
        path: ["locationLat"],
      });
    }

    if (input.locationMode === "IN_PERSON" && hasLat !== hasLng) {
      ctx.addIssue({
        code: "custom",
        message: "Provide both latitude and longitude.",
        path: hasLat ? ["locationLng"] : ["locationLat"],
      });
    }

    if (input.cost === "PAID" && input.costAmount == null) {
      ctx.addIssue({
        code: "custom",
        message: "Paid plans need a positive amount.",
        path: ["costAmount"],
      });
    }

    if (input.cost === "FREE" && input.costAmount != null) {
      ctx.addIssue({
        code: "custom",
        message: "Free plans must omit the amount.",
        path: ["costAmount"],
      });
    }
  });

export type ForgePlanInput = z.infer<typeof forgePlanInputSchema>;

const forgeMatchingPreferenceSchema = z.number().int().min(0).max(100);

export const forgeMatchingPreferencesInputSchema = z
  .object({
    sharedGround: forgeMatchingPreferenceSchema.optional(),
    freshPerspectives: forgeMatchingPreferenceSchema.optional(),
    networkReach: forgeMatchingPreferenceSchema.optional(),
    maxDistanceKm: z.number().int().min(15).max(80).optional(),
  })
  .strict();

export type ForgeMatchingPreferencesInput = z.infer<
  typeof forgeMatchingPreferencesInputSchema
>;

export const forgeActivityInputSchema = z
  .object({
    groupSize: z.number().int().min(2).max(8),
    groupName: z.string().trim().min(1).max(120).nullable().optional(),
    groupDescription: z.string().trim().min(1).max(1000).nullable().optional(),
    groupAvatar: managedUploadUrlSchema.nullable().optional(),
    plan: forgePlanInputSchema,
    matchingPreferences: forgeMatchingPreferencesInputSchema.optional(),
  })
  .strict();

export type ForgeActivityInput = z.infer<typeof forgeActivityInputSchema>;

export const forgedChatSchema = z.object({
  id: z.string(),
  type: z.enum(["GROUP", "PRIVATE"]),
});

export type ForgedChat = z.infer<typeof forgedChatSchema>;

export const forgedGroupMemberSchema = z.object({
  userId: z.string(),
  role: groupRoleSchema,
  compatibilityScore: z.number().nullable(),
});

export type ForgedGroupMember = z.infer<typeof forgedGroupMemberSchema>;

export const forgedGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: groupStatusSchema,
  maxMembers: z.number().int(),
  members: z.array(forgedGroupMemberSchema),
});

export type ForgedGroup = z.infer<typeof forgedGroupSchema>;

export const forgedPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  coverImage: z.string().nullable(),
  category: planCategorySchema,
  status: planStatusSchema,
  locationMode: locationModeSchema,
  cost: costTypeSchema,
});

export type ForgedPlan = z.infer<typeof forgedPlanSchema>;

export const forgeActivityResultSchema = z.object({
  activityId: z.string(),
  activityStatus: activityStatusSchema,
  chat: forgedChatSchema,
  group: forgedGroupSchema,
  plan: forgedPlanSchema,
});

export type ForgeActivityResult = z.infer<typeof forgeActivityResultSchema>;
