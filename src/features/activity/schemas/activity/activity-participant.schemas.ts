import { z } from "zod";

import {
  userAvatarMediaField,
  userIdentitySummaryFields,
  userPersonalityScoreFields,
  userPresenceFields,
  userProfileSummaryFields,
} from "@/shared/schemas/entity-fragments";
import { personalityTypeSchema } from "@/shared/schemas/enums";

export const activityParticipantSchema = z.object({
  ...userIdentitySummaryFields,
  ...userAvatarMediaField,
  ...userProfileSummaryFields,
  personalityType: personalityTypeSchema.nullable().optional(),
  ...userPersonalityScoreFields,
  ...userPresenceFields,
  lastReadMessageId: z.string().nullable().optional(),
});

export type ActivityParticipant = z.infer<typeof activityParticipantSchema>;
