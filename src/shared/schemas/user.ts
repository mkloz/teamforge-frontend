import { z } from "zod";

import { userCoreFields } from "./entity-fragments";

const interestData = {
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  parentId: z.string().nullable(),
  aliases: z.array(z.string()),
};

export type Interest = z.infer<z.ZodObject<typeof interestData>> & {
  parent?: Interest;
  children?: Interest[];
};

export const interestSchema: z.ZodSchema<Interest> = z.lazy(() =>
  z.object(interestData).extend({
    parent: interestSchema.optional(),
    children: z.array(interestSchema).optional(),
  }),
);

export type User = z.infer<z.ZodObject<typeof userCoreFields>> & {
  interests?: Interest[];
  onboardingIntent?:
    | "BRING_A_PLAN"
    | "EXPLORE_AND_JOIN"
    | "BOTH_OR_UNSURE"
    | null;
};

export const userSchema: z.ZodSchema<User> = z.lazy(() =>
  z.object(userCoreFields).extend({
    interests: z.array(interestSchema).optional(),
  }),
);
