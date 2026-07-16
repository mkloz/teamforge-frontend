import { z } from "zod";

import {
  authProviderSchema,
  genderSchema,
  groupStatusSchema,
  onlineStatusSchema,
  personalityTypeSchema,
  searchStatusSchema,
} from "./enums";
import { imageMediaSchema } from "./media";

export const groupBaseFields = {
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  avatar: z.string().nullable(),
  avatarMedia: imageMediaSchema.nullable().optional(),
  status: groupStatusSchema,
  maxMembers: z.number(),
};

export const userCoreFields = {
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
  trustScore: z.number(),
  profileComplete: z.boolean(),
  personalitySetupComplete: z.boolean().optional(),
  showFriendsListOnProfile: z.boolean().default(true),
};

export const userIdentitySummaryFields = {
  id: userCoreFields.id,
  name: userCoreFields.name,
  avatar: userCoreFields.avatar,
};

export const userAvatarMediaField = {
  avatarMedia: imageMediaSchema.nullable().optional(),
};

export const userProfileSummaryFields = {
  bio: userCoreFields.bio.optional(),
  age: userCoreFields.age.optional(),
  gender: userCoreFields.gender.optional(),
  city: userCoreFields.city.optional(),
};

export const userPersonalityScoreFields = {
  oceanO: userCoreFields.oceanO.optional(),
  oceanC: userCoreFields.oceanC.optional(),
  oceanE: userCoreFields.oceanE.optional(),
  oceanA: userCoreFields.oceanA.optional(),
  oceanN: userCoreFields.oceanN.optional(),
};

export const userOptionalPersonalityTypeField = {
  personalityType: userCoreFields.personalityType.optional(),
};

export const userTrustScoreField = {
  trustScore: userCoreFields.trustScore,
};

export const userOptionalTrustScoreField = {
  trustScore: userCoreFields.trustScore.optional(),
};

export const userPresenceFields = {
  onlineStatus: userCoreFields.onlineStatus,
};
