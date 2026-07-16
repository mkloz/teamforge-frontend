import { z } from "zod";

import { groupStatusSchema } from "./enums";

const inviteTypeSchema = z.enum([
  "ALGORITHM_MATCH",
  "FRIEND_INVITE",
  "DIRECT_INVITE",
  "JOIN_REQUEST",
]);

const inviteStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "CANCELLED",
]);

export const createInvitePayloadSchema = z.object({
  groupId: z.string().min(1),
  inviteeId: z.string().min(1),
  type: z.enum(["FRIEND_INVITE", "DIRECT_INVITE"]).optional(),
  message: z.string().trim().max(500).optional(),
});

const inviteGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  status: groupStatusSchema,
  maxMembers: z.number(),
  activeMembersCount: z.number(),
});

const inviteUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
});

export const inviteSchema = z
  .object({
    id: z.string(),
    type: inviteTypeSchema,
    status: inviteStatusSchema,
    message: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().nullable(),
    respondedAt: z.string().datetime().nullable(),
    version: z.number().optional(),
    groupId: z.string(),
    inviteeId: z.string(),
    inviterId: z.string().nullable(),
    group: inviteGroupSchema,
    invitee: inviteUserSchema,
    inviter: inviteUserSchema.nullable(),
  })
  .transform((invite) => {
    const updatedAt =
      invite.updatedAt ?? invite.respondedAt ?? invite.createdAt;

    return {
      ...invite,
      updatedAt,
      version: invite.version ?? Date.parse(updatedAt),
    };
  });

export type Invite = z.infer<typeof inviteSchema>;
