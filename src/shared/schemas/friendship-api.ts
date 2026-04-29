import { z } from "zod";

import {
  chatTypeSchema,
  friendshipStatusSchema,
  onlineStatusSchema,
  personalityTypeSchema,
} from "./enums";

export const friendshipUserApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  city: z.string().nullable().optional(),
  personalityType: personalityTypeSchema.nullable(),
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

export const friendshipApiSchema = z.object({
  status: friendshipStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  requesterId: z.string(),
  receiverId: z.string(),
  privateChatId: z.string().nullable(),
  requester: friendshipUserApiSchema,
  receiver: friendshipUserApiSchema,
  counterpart: friendshipUserApiSchema,
  privateChat: friendshipPrivateChatApiSchema.nullable().optional(),
});

export type FriendshipApi = z.infer<typeof friendshipApiSchema>;
