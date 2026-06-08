import { z } from "zod";
import type { Chat } from "./chat";
import { chatSchema } from "./chat";
import { friendshipStatusSchema } from "./enums";
import type { Group } from "./group";
import { groupSchema } from "./group";
import type { User } from "./user";
import { userSchema } from "./user";

const friendshipData = {
  requesterId: z.string(),
  receiverId: z.string(),
  status: friendshipStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  privateChatId: z.string().nullable(),
};

export type Friendship = z.infer<z.ZodObject<typeof friendshipData>> & {
  requester?: User;
  receiver?: User;
  privateChat?: Chat;
};

export const friendshipSchema: z.ZodSchema<Friendship> = z.lazy(() =>
  z.object(friendshipData).extend({
    requester: userSchema.optional(),
    receiver: userSchema.optional(),
    privateChat: chatSchema.optional(),
  }),
);

const ratingData = {
  id: z.string(),
  score: z.number(),
  comment: z.string().nullable(),
  createdAt: z.string().datetime(),
  raterId: z.string(),
  rateeId: z.string(),
  groupId: z.string(),
};

export type Rating = z.infer<z.ZodObject<typeof ratingData>> & {
  rater?: User;
  ratee?: User;
  group?: Group;
};

export const ratingSchema: z.ZodSchema<Rating> = z.lazy(() =>
  z.object(ratingData).extend({
    rater: userSchema.optional(),
    ratee: userSchema.optional(),
    group: groupSchema.optional(),
  }),
);
