import { z } from "zod";

import { groupStatusSchema, personalityTypeSchema } from "./enums";

export const inviteTypeSchema = z.enum([
  "ALGORITHM_MATCH",
  "FRIEND_INVITE",
  "DIRECT_INVITE",
]);

export type InviteType = z.infer<typeof inviteTypeSchema>;

export const inviteStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "CANCELLED",
]);

export type InviteStatus = z.infer<typeof inviteStatusSchema>;

export const inviteGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  status: groupStatusSchema,
  maxMembers: z.number(),
  activeMembersCount: z.number(),
});

export type InviteGroup = z.infer<typeof inviteGroupSchema>;

export const inviteUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  personalityType: personalityTypeSchema.nullable(),
  trustScore: z.number(),
});

export type InviteUser = z.infer<typeof inviteUserSchema>;

export const inviteSchema = z.object({
  id: z.string(),
  type: inviteTypeSchema,
  status: inviteStatusSchema,
  message: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  respondedAt: z.string().datetime().nullable(),
  version: z.number(),
  groupId: z.string(),
  inviteeId: z.string(),
  inviterId: z.string().nullable(),
  group: inviteGroupSchema,
  invitee: inviteUserSchema,
  inviter: inviteUserSchema.nullable(),
});

export type Invite = z.infer<typeof inviteSchema>;
