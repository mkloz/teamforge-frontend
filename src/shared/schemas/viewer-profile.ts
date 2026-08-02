import { z } from "zod";

import { genderSchema } from "./enums";
import { imageMediaSchema } from "./media";
import { publicPersonalityProfileSchema } from "./public-personality-profile";
import { reputationSummarySchema } from "./reputation";
import { interestSchema, userSchema } from "./user";

export const viewerProfileContextSchema = z.enum([
  "SELF",
  "CURRENT_GROUP",
  "FORMER_GROUP",
  "ACCEPTED_FRIEND",
  "MINIMAL",
]);

const viewerProfileResponseSchema = z.object({
  viewerContext: viewerProfileContextSchema,
  canReport: z.boolean(),
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  avatarMedia: imageMediaSchema.nullable().optional(),
  bio: z.string().nullable(),
  createdAt: z.string().datetime(),
  age: z.number().nullable(),
  gender: genderSchema.nullable(),
  city: z.string().nullable(),
  interests: z.array(interestSchema),
  showFriendsListOnProfile: z.boolean(),
  personalityProfile: publicPersonalityProfileSchema.nullable(),
  trustScore: z.number().optional(),
  reputationSummary: reputationSummarySchema.optional(),
});

export const viewerProfileSchema = viewerProfileResponseSchema.transform(
  (profile) => {
    const personality = profile.personalityProfile;
    const user = userSchema.parse({
      id: profile.id,
      email: `${profile.id}@teamforge.local`,
      name: profile.name,
      avatar: profile.avatar,
      bio: profile.bio,
      authProvider: "EMAIL",
      googleId: null,
      emailVerified: false,
      createdAt: profile.createdAt,
      updatedAt: profile.createdAt,
      age: profile.age,
      gender: profile.gender,
      city: profile.city,
      locationLat: null,
      locationLng: null,
      personalityType: personality?.personalityType ?? null,
      oceanO: personality?.ocean.openness ?? null,
      oceanC: personality?.ocean.conscientiousness ?? null,
      oceanE: personality?.ocean.extraversion ?? null,
      oceanA: personality?.ocean.agreeableness ?? null,
      oceanN: personality?.ocean.neuroticism ?? null,
      searchStatus: "IDLE",
      trustScore:
        typeof profile.reputationSummary?.displayScore === "number"
          ? profile.reputationSummary.displayScore / 100
          : 0,
      reputationSummary: profile.reputationSummary,
      profileComplete: personality !== null,
      personalitySetupComplete: personality !== null,
      showFriendsListOnProfile: profile.showFriendsListOnProfile,
      interests: profile.interests,
    });

    return {
      ...user,
      avatarMedia: profile.avatarMedia,
      canReport: profile.canReport,
      personalityProfile: personality,
      viewerContext: profile.viewerContext,
    };
  },
);

export type ViewerProfileContext = z.infer<typeof viewerProfileContextSchema>;
export type ViewerProfile = z.infer<typeof viewerProfileSchema>;
