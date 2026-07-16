import { z } from "zod";

import { genderSchema } from "./enums";
import { imageMediaSchema } from "./media";
import { publicPersonalityProfileSchema } from "./public-personality-profile";
import { interestSchema } from "./user";

export const viewerProfileContextSchema = z.enum([
  "SELF",
  "CURRENT_GROUP",
  "ACCEPTED_FRIEND",
  "MINIMAL",
]);

export const viewerProfileSchema = z.object({
  viewerContext: viewerProfileContextSchema,
  canReport: z.boolean(),
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  avatarMedia: imageMediaSchema.nullable().optional(),
  bio: z.string().nullable(),
  createdAt: z.string().datetime().nullable(),
  age: z.number().nullable(),
  gender: genderSchema.nullable(),
  city: z.string().nullable(),
  interests: z.array(interestSchema),
  showFriendsListOnProfile: z.boolean(),
  personalityProfile: publicPersonalityProfileSchema.nullable(),
});

export type ViewerProfileContext = z.infer<typeof viewerProfileContextSchema>;
export type ViewerProfile = z.infer<typeof viewerProfileSchema>;
