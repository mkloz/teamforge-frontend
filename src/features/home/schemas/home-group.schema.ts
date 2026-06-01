import { z } from "zod";
import {
  costTypeSchema,
  groupStatusSchema,
  locationModeSchema,
  planCategorySchema,
  planStatusSchema,
} from "@/shared/schemas/enums";
import { imageMediaSchema } from "@/shared/schemas/media";

const homeGroupInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const homeGroupActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  interests: z.array(homeGroupInterestSchema),
});

const homeGroupPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  status: planStatusSchema,
  dateTime: z.string().datetime().nullable(),
  locationMode: locationModeSchema,
  location: z.string().nullable(),
  cost: costTypeSchema,
});

const homeGroupMemberSchema = z.object({
  userId: z.string(),
});

export const homeGroupSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
    avatarMedia: imageMediaSchema.nullable().optional(),
    status: groupStatusSchema,
    maxMembers: z.number(),
    updatedAt: z.string().datetime(),
    version: z.number().optional(),
    activity: homeGroupActivitySchema,
    plan: homeGroupPlanSchema.nullable(),
    members: z.array(homeGroupMemberSchema),
  })
  .transform((group) => ({
    ...group,
    version: group.version ?? Date.parse(group.updatedAt),
  }));

export type HomeGroup = z.infer<typeof homeGroupSchema>;
