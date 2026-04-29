import { z } from "zod";
import {
  authProviderSchema,
  genderSchema,
  onlineStatusSchema,
  personalityTypeSchema,
  searchStatusSchema,
} from "./enums";

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

const userData = {
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  authProvider: authProviderSchema,
  googleId: z.string().nullable().optional(),
  emailVerified: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  age: z.number().nullable(),
  gender: genderSchema.nullable(),
  city: z.string().nullable(),
  personalityType: personalityTypeSchema.nullable(),
  oceanO: z.number().nullable(),
  oceanC: z.number().nullable(),
  oceanE: z.number().nullable(),
  oceanA: z.number().nullable(),
  oceanN: z.number().nullable(),
  searchStatus: searchStatusSchema,
  onlineStatus: onlineStatusSchema.optional(),
  trustScore: z.number(),
  profileComplete: z.boolean(),
};

export type User = z.infer<z.ZodObject<typeof userData>> & {
  interests?: Interest[];
};

export const userSchema: z.ZodSchema<User> = z.lazy(() =>
  z.object(userData).extend({
    interests: z.array(interestSchema).optional(),
  }),
);
