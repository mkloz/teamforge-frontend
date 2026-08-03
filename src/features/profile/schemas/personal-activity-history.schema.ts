import { z } from "zod";

const personalActivityHistoryItemSchema = z.object({
  id: z.string(),
  completedAt: z.string(),
  activityTitle: z.string(),
  groupName: z.string(),
  planTitle: z.string(),
  planCategory: z.string(),
  coverImage: z.string().nullable(),
  participantScope: z.enum(["MEMBER", "GUEST"]),
  attendance: z.enum(["ATTENDED", "DID_NOT_ATTEND", "UNKNOWN"]),
  verificationState: z.enum([
    "UNKNOWN",
    "SELF_REPORTED",
    "ORGANIZER_REPORTED",
    "CORRECTED",
  ]),
  groupId: z.string().nullable(),
  repeatSourcePlanId: z.string().nullable(),
});

export const personalActivityHistoryPageSchema = z.object({
  items: z.array(personalActivityHistoryItemSchema),
  nextCursor: z.string().nullable(),
});

export type PersonalActivityHistoryItem = z.infer<
  typeof personalActivityHistoryItemSchema
>;
