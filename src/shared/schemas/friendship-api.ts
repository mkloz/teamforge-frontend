import { z } from "zod";

import {
  userIdentitySummaryFields,
  userPersonalityScoreFields,
  userPresenceFields,
  userProfileSummaryFields,
  userTrustScoreField,
} from "./entity-fragments";
import {
  chatTypeSchema,
  friendshipStatusSchema,
  personalityTypeSchema,
} from "./enums";

const friendshipUserApiSchema = z.object({
  ...userIdentitySummaryFields,
  ...userProfileSummaryFields,
  personalityType: personalityTypeSchema.nullable(),
  ...userPersonalityScoreFields,
  ...userTrustScoreField,
  ...userPresenceFields,
});

export type FriendshipUserApi = z.infer<typeof friendshipUserApiSchema>;

const friendshipPrivateChatApiSchema = z.object({
  id: z.string(),
  type: chatTypeSchema,
  createdAt: z.string().datetime(),
});

export type FriendshipPrivateChatApi = z.infer<
  typeof friendshipPrivateChatApiSchema
>;

export const friendshipApiSchema = z
  .object({
    status: friendshipStatusSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    version: z.number().optional(),
    requesterId: z.string(),
    receiverId: z.string(),
    privateChatId: z.string().nullable(),
    requester: friendshipUserApiSchema,
    receiver: friendshipUserApiSchema,
    counterpart: friendshipUserApiSchema,
    privateChat: friendshipPrivateChatApiSchema.nullable().optional(),
  })
  .transform((friendship) => ({
    ...friendship,
    version: friendship.version ?? Date.parse(friendship.updatedAt),
  }));

export type FriendshipApi = z.infer<typeof friendshipApiSchema>;
