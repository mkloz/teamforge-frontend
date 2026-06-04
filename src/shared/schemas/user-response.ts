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
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
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
  showFriendsListOnProfile: z.boolean().default(true),
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
  createdAt: z.string().datetime(),
  age: z.number().nullable().optional(),
  gender: genderSchema.nullable().optional(),
  city: z.string().nullable().optional(),
  personalityType: personalityTypeSchema.nullable().optional(),
  oceanO: z.number().nullable().optional(),
  oceanC: z.number().nullable().optional(),
  oceanE: z.number().nullable().optional(),
  oceanA: z.number().nullable().optional(),
  oceanN: z.number().nullable().optional(),
  onlineStatus: onlineStatusSchema.optional(),
  trustScore: z.number(),
  showFriendsListOnProfile: z.boolean(),
  interests: z.array(interestSchema).optional(),
});

export const publicUserResponseSchema = publicUserResponseInputSchema.transform(
  (user) =>
    userSchema.parse({
      id: user.id,
      email: `${user.id}@teamforge.local`,
      name: user.name,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      authProvider: "EMAIL",
      googleId: null,
      emailVerified: false,
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
      age: user.age ?? null,
      gender: user.gender ?? null,
      city: user.city ?? null,
      locationLat: null,
      locationLng: null,
      personalityType: user.personalityType ?? null,
      oceanO: user.oceanO ?? null,
      oceanC: user.oceanC ?? null,
      oceanE: user.oceanE ?? null,
      oceanA: user.oceanA ?? null,
      oceanN: user.oceanN ?? null,
      searchStatus: "IDLE",
      onlineStatus: user.onlineStatus,
      trustScore: user.trustScore,
      showFriendsListOnProfile: user.showFriendsListOnProfile,
      profileComplete: true,
      interests: user.interests ?? [],
    }),
);
