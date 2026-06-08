import { z } from "zod";

import {
  chatTypeSchema,
  friendshipStatusSchema,
  genderSchema,
  onlineStatusSchema,
  personalityTypeSchema,
} from "./enums";

export const friendshipUserApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  bio: z.string().nullable().optional(),
  age: z.number().nullable().optional(),
  gender: genderSchema.nullable().optional(),
  city: z.string().nullable().optional(),
  personalityType: personalityTypeSchema.nullable(),
  oceanO: z.number().nullable().optional(),
  oceanC: z.number().nullable().optional(),
  oceanE: z.number().nullable().optional(),
  oceanA: z.number().nullable().optional(),
  oceanN: z.number().nullable().optional(),
  trustScore: z.number(),
  onlineStatus: onlineStatusSchema.optional(),
});

export type FriendshipUserApi = z.infer<typeof friendshipUserApiSchema>;

export const friendshipPrivateChatApiSchema = z.object({
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
