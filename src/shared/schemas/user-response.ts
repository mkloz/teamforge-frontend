import { z } from "zod";

import {
  userCoreFields,
  userIdentitySummaryFields,
  userOptionalPersonalityTypeField,
  userPersonalityScoreFields,
  userPresenceFields,
  userProfileSummaryFields,
  userTrustScoreField,
} from "./entity-fragments";
import { interestSchema, userSchema } from "./user";

const fullUserResponseInputSchema = z.object({
  ...userCoreFields,
  trustScore: userCoreFields.trustScore.default(0),
  profileComplete: userCoreFields.profileComplete.default(false),
  interests: z.array(interestSchema).optional(),
});

export const fullUserResponseSchema = fullUserResponseInputSchema.transform(
  (user) => userSchema.parse(user),
);

const publicUserResponseInputSchema = z.object({
  ...userIdentitySummaryFields,
  avatar: userIdentitySummaryFields.avatar.optional(),
  bio: userProfileSummaryFields.bio,
  createdAt: z.string().datetime(),
  age: userProfileSummaryFields.age,
  gender: userProfileSummaryFields.gender,
  city: userProfileSummaryFields.city,
  ...userOptionalPersonalityTypeField,
  ...userPersonalityScoreFields,
  ...userPresenceFields,
  ...userTrustScoreField,
  showFriendsListOnProfile: z.boolean(),
  interests: z.array(interestSchema).optional(),
});

type PublicUserResponseInput = z.output<typeof publicUserResponseInputSchema>;

function getPublicUserProfileDefaults(user: PublicUserResponseInput) {
  return {
    avatar: user.avatar ?? null,
    bio: user.bio ?? null,
    age: user.age ?? null,
    gender: user.gender ?? null,
    city: user.city ?? null,
    personalityType: user.personalityType ?? null,
  };
}

function getPublicUserPersonalityDefaults(user: PublicUserResponseInput) {
  return {
    oceanO: user.oceanO ?? null,
    oceanC: user.oceanC ?? null,
    oceanE: user.oceanE ?? null,
    oceanA: user.oceanA ?? null,
    oceanN: user.oceanN ?? null,
  };
}

function toPublicUserSchemaInput(user: PublicUserResponseInput) {
  const profileDefaults = getPublicUserProfileDefaults(user);

  return {
    id: user.id,
    email: `${user.id}@teamforge.local`,
    name: user.name,
    avatar: profileDefaults.avatar,
    bio: profileDefaults.bio,
    authProvider: "EMAIL",
    googleId: null,
    emailVerified: false,
    createdAt: user.createdAt,
    updatedAt: user.createdAt,
    age: profileDefaults.age,
    gender: profileDefaults.gender,
    city: profileDefaults.city,
    locationLat: null,
    locationLng: null,
    personalityType: profileDefaults.personalityType,
    ...getPublicUserPersonalityDefaults(user),
    searchStatus: "IDLE",
    onlineStatus: user.onlineStatus,
    trustScore: user.trustScore,
    showFriendsListOnProfile: user.showFriendsListOnProfile,
    profileComplete: true,
    interests: user.interests ?? [],
  };
}

export const publicUserResponseSchema = publicUserResponseInputSchema.transform(
  (user) => userSchema.parse(toPublicUserSchemaInput(user)),
);
