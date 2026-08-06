import { z } from "zod";

import { groupBaseFields, userIdentitySummaryFields } from "./entity-fragments";
import {
  activityAccessSchema,
  activityVisibilitySchema,
  costTypeSchema,
  forgeScopeSchema,
  locationModeSchema,
  planCategorySchema,
  planScheduleModeSchema,
} from "./enums";
import { imageMediaSchema } from "./media";

export const exploreInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const compatibilitySchema = z.object({
  interestOverlap: z.number(),
  cityAlignment: z.number(),
  ageAlignment: z.number(),
  friendshipProximity: z.number(),
  total: z.number(),
});

const exploreActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  interests: z.array(exploreInterestSchema),
});

const explorePlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  scheduleMode: planScheduleModeSchema.nullish(),
  dateTime: z.string().datetime().nullable(),
  locationMode: locationModeSchema,
  cost: costTypeSchema,
});

const exploreMemberSchema = z.object({
  ...userIdentitySummaryFields,
  avatarMedia: imageMediaSchema.nullable(),
});

export const exploreGroupSchema = z.object({
  ...groupBaseFields,
  avatarMedia: imageMediaSchema.nullable(),
  updatedAt: z.string().datetime(),
  version: z.number(),
  activeMembersCount: z.number(),
  access: activityAccessSchema,
  activity: exploreActivitySchema,
  plan: explorePlanSchema.nullable(),
  members: z.array(exploreMemberSchema),
  compatibility: compatibilitySchema,
});

export type ExploreGroup = z.infer<typeof exploreGroupSchema>;

const introductoryExploreInterestSchema = z
  .object({
    name: z.string(),
    slug: z.string(),
  })
  .strict();

const introductoryExploreActivitySchema = z
  .object({
    interests: z.array(introductoryExploreInterestSchema),
  })
  .strict();

const introductoryExplorePlanSchema = z
  .object({
    category: planCategorySchema,
    scheduleMode: planScheduleModeSchema.nullable(),
    locationMode: locationModeSchema,
    cost: costTypeSchema,
  })
  .strict();

export const introductoryExploreGroupSchema = z
  .object({
    id: z.string(),
    activeMembersCount: z.number().int().nonnegative(),
    maxMembers: z.number().int().positive(),
    activity: introductoryExploreActivitySchema,
    plan: introductoryExplorePlanSchema.nullable(),
    interestFitPercentage: z.number().int().min(0).max(100),
  })
  .strict();

export type IntroductoryExploreGroup = z.infer<
  typeof introductoryExploreGroupSchema
>;

export const exploreFormationOpeningSchema = z
  .object({
    id: z.string(),
    expiresAt: z.string().datetime(),
    activity: z
      .object({
        id: z.string(),
        title: z.string(),
      })
      .strict(),
    scope: forgeScopeSchema,
    category: planCategorySchema,
    broadArea: z.string().nullable(),
    schedule: z
      .object({
        mode: planScheduleModeSchema,
        dateTime: z.string().datetime().nullable(),
      })
      .strict(),
    cost: z
      .object({
        type: costTypeSchema,
        amount: z.number().nullable(),
      })
      .strict(),
    readyCount: z.number().int().nonnegative(),
    neededCount: z.literal(1),
    viewerApplication: z
      .object({
        state: z.literal("PENDING"),
        version: z.number().int().min(1),
      })
      .strict()
      .nullable(),
  })
  .strict();

export type ExploreFormationOpening = z.infer<
  typeof exploreFormationOpeningSchema
>;

export const exploreFeedItemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("GROUP"),
    group: exploreGroupSchema,
  }),
  z
    .object({
      type: z.literal("FORMATION_OPENING"),
      opening: exploreFormationOpeningSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("INTRODUCTORY_GROUP"),
      group: introductoryExploreGroupSchema,
    })
    .strict(),
]);

export type ExploreFeedItem = z.infer<typeof exploreFeedItemSchema>;

export const exploreViewInsightSchema = z.object({
  summary: z.string(),
  bullets: z.array(z.string()).min(1),
});

export type ExploreViewInsight = z.infer<typeof exploreViewInsightSchema>;

export const exploreJoinResultSchema = z.object({
  status: z.enum(["JOINED", "REQUESTED"]),
  groupId: z.string(),
  chatId: z.string().nullable(),
  message: z.string(),
});

export type ExploreJoinResult = z.infer<typeof exploreJoinResultSchema>;

export const exploreJoinRequestCancelResultSchema = z.object({
  status: z.literal("CANCELLED"),
  groupId: z.string(),
  message: z.string(),
});
