import { z } from "zod";
import {
  activityVisibilitySchema,
  activityAccessSchema,
  forgeModeSchema,
  activityStatusSchema,
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
  group?: Group;
};

export const activitySchema: z.ZodSchema<Activity> = z.lazy(() =>
  z.object(activityData).extend({
    creator: userSchema.optional(),
    interests: z.array(interestSchema).optional(),
    group: groupSchema.optional(),
  }),
);
