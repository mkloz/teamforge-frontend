import { z } from "zod";
import {
  activityAccessSchema,
  activityVisibilitySchema,
  forgeModeSchema,
  activityStatusSchema,
  costTypeSchema,
  locationModeSchema,
  planCategorySchema,
  planStatusSchema,
  groupRoleSchema,
  groupStatusSchema,
} from "./enums";
import type { User, Interest } from "./user";
import { userSchema, interestSchema } from "./user";
import type { Group } from "./group";
import { groupSchema } from "./group";

const activityData = {
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  city: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  forgeMode: forgeModeSchema,
  status: activityStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  creatorId: z.string(),
};

export type Activity = z.infer<z.ZodObject<typeof activityData>> & {
  creator?: User;
  interests?: Interest[];
  group?: Group | null;
};

export const activitySchema: z.ZodSchema<Activity> = z.lazy(() =>
  z.object(activityData).extend({
    creator: userSchema.optional(),
    interests: z.array(interestSchema).optional(),
    group: groupSchema.nullable().optional(),
  }),
);

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
    coverImage: z.string().trim().min(1).max(2048).nullable().optional(),
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

export const forgeActivityInputSchema = z
  .object({
    groupSize: z.number().int().min(2).max(8),
    groupName: z.string().trim().min(1).max(120).nullable().optional(),
    groupDescription: z.string().trim().min(1).max(1000).nullable().optional(),
    groupAvatar: z.string().trim().min(1).max(2048).nullable().optional(),
    plan: forgePlanInputSchema,
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
