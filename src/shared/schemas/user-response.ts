import { z } from "zod";

import {
  authProviderSchema,
  genderSchema,
  onlineStatusSchema,
  personalityTypeSchema,
  searchStatusSchema,
} from "./enums";
import { interestSchema, userSchema } from "./user";

const fullUserResponseInputSchema = z.object({
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
  trustScore: z.number().default(0),
  profileComplete: z.boolean().default(false),
  interests: z.array(interestSchema).optional(),
});

export const fullUserResponseSchema = fullUserResponseInputSchema.transform(
  (user) =>
    userSchema.parse({
      ...user,
      name: user.name,
    }),
);

const publicUserResponseInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().email().optional(),
  authProvider: authProviderSchema.optional(),
  emailVerified: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  age: z.number().nullable().optional(),
  gender: genderSchema.nullable().optional(),
  city: z.string().nullable().optional(),
  personalityType: personalityTypeSchema.nullable().optional(),
  oceanO: z.number().nullable().optional(),
  oceanC: z.number().nullable().optional(),
  oceanE: z.number().nullable().optional(),
  oceanA: z.number().nullable().optional(),
  oceanN: z.number().nullable().optional(),
  searchStatus: searchStatusSchema.optional(),
  onlineStatus: onlineStatusSchema.optional(),
  trustScore: z.number(),
  profileComplete: z.boolean().optional(),
  interests: z.array(interestSchema).optional(),
});

export const publicUserResponseSchema = publicUserResponseInputSchema.transform(
  (user) =>
    userSchema.parse({
      id: user.id,
      email: user.email ?? `${user.id}@teamforge.local`,
      name: user.name,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      authProvider: user.authProvider ?? "EMAIL",
      googleId: null,
      emailVerified: user.emailVerified ?? false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt ?? user.createdAt,
      age: user.age ?? null,
      gender: user.gender ?? null,
      city: user.city ?? null,
      personalityType: user.personalityType ?? null,
      oceanO: user.oceanO ?? null,
      oceanC: user.oceanC ?? null,
      oceanE: user.oceanE ?? null,
      oceanA: user.oceanA ?? null,
      oceanN: user.oceanN ?? null,
      searchStatus: user.searchStatus ?? "IDLE",
      onlineStatus: user.onlineStatus,
      trustScore: user.trustScore,
      profileComplete: user.profileComplete ?? true,
      interests: user.interests ?? [],
    }),
);
