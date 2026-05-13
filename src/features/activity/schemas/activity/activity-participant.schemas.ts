import { z } from "zod";

import {
  genderSchema,
  onlineStatusSchema,
  personalityTypeSchema,
} from "@/shared/schemas/enums";

export const activityParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  bio: z.string().nullable().optional(),
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
  compatibilityScore: z.number().nullable().optional(),
});

export type ActivityParticipant = z.infer<typeof activityParticipantSchema>;
