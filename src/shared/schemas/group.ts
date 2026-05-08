// oxlint-disable import/no-cycle -- Recursive schemas are resolved with z.lazy.
import { z } from "zod";
import type { Activity } from "./activity";
import { activitySchema } from "./activity";
import type { Chat } from "./chat";
import { chatSchema } from "./chat";
import { groupRoleSchema, groupStatusSchema } from "./enums";
import type { Plan } from "./plan";
import { planSchema } from "./plan";
import type { User } from "./user";
import { userSchema } from "./user";

const groupMemberData = {
  userId: z.string(),
  groupId: z.string(),
  role: groupRoleSchema,
  joinedAt: z.string().datetime(),
  leftAt: z.string().datetime().nullable(),
  compatibilityScore: z.number().nullable(),
};

export type GroupMember = z.infer<z.ZodObject<typeof groupMemberData>> & {
  user?: User;
  group?: Group;
};

export const groupMemberSchema: z.ZodSchema<GroupMember> = z.lazy(() =>
  z.object(groupMemberData).extend({
    user: userSchema.optional(),
    group: groupSchema.optional(),
  }),
);

const groupData = {
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  avatar: z.string().nullable(),
  status: groupStatusSchema,
  maxMembers: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  disbandedAt: z.string().datetime().nullable(),
  activityId: z.string(),
};

export type Group = z.infer<z.ZodObject<typeof groupData>> & {
  activity?: Activity;
  members?: GroupMember[];
  plan?: Plan;
  chat?: Chat;
};

export const groupSchema: z.ZodSchema<Group> = z.lazy(() =>
  z.object(groupData).extend({
    activity: activitySchema.optional(),
    members: z.array(groupMemberSchema).optional(),
    plan: planSchema.optional(),
    chat: chatSchema.optional(),
  }),
);
