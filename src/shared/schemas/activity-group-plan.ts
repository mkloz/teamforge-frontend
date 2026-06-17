import { z } from "zod";
import type { Chat } from "./chat";
import { chatSchema } from "./chat";
import {
  activityAccessSchema,
  activityStatusSchema,
  activityVisibilitySchema,
  costTypeSchema,
  forgeModeSchema,
  groupRoleSchema,
  groupStatusSchema,
  locationModeSchema,
  planCategorySchema,
  planProposalFieldSchema,
  planProposalStatusSchema,
  planProposalVoteSchema,
  planStatusSchema,
} from "./enums";
import type { Interest, User } from "./user";
import { interestSchema, userSchema } from "./user";

const activityData = {
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  city: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  forgeMode: forgeModeSchema,
  status: activityStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  creatorId: z.string(),
};

export type Activity = z.infer<z.ZodObject<typeof activityData>> & {
  creator?: User;
  interests?: Interest[];
  group?: Group | null;
};

export const activitySchema: z.ZodSchema<Activity> = z.lazy(() =>
  z.object(activityData).extend({
    creator: userSchema.optional(),
    interests: z.array(interestSchema).optional(),
    group: groupSchema.nullable().optional(),
  }),
);

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

const planProposalShape = z.object({
  id: z.string(),
  field: planProposalFieldSchema,
  currentValue: z.string().nullable(),
  proposedValue: z.string(),
  status: planProposalStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  resolvedAt: z.string().datetime().nullable(),
  version: z.number().optional(),
  planId: z.string(),
  proposerId: z.string(),
  proposer: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
  }),
  votes: z.array(
    z.object({
      userId: z.string(),
      vote: planProposalVoteSchema,
      createdAt: z.string().datetime(),
    }),
  ),
});

export type PlanProposal = z.infer<typeof planProposalShape> & {
  updatedAt: string;
  version: number;
};

export const planProposalSchema: z.ZodSchema<PlanProposal> = z.lazy(() =>
  planProposalShape.transform((proposal) => {
    const updatedAt =
      proposal.updatedAt ?? proposal.resolvedAt ?? proposal.createdAt;

    return {
      ...proposal,
      updatedAt,
      version: proposal.version ?? Date.parse(updatedAt),
    };
  }),
);

const planShape = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: planCategorySchema,
  coverImage: z.string().nullable(),
  status: planStatusSchema,
  dateTime: z.string().datetime().nullable(),
  locationMode: locationModeSchema,
  location: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  cost: costTypeSchema,
  costAmount: z.number().nullable(),
  costDetails: z.string().nullable(),
  completedAt: z.string().datetime().nullable(),
  cancelledAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().optional(),
  groupId: z.string(),
});

export type Plan = z.infer<typeof planShape> & {
  version: number;
  group?: Group;
  proposals?: PlanProposal[];
};

export const planSchema: z.ZodSchema<Plan> = z.lazy(() =>
  planShape
    .extend({
      group: groupSchema.optional(),
      proposals: z.array(planProposalSchema).optional(),
    })
    .transform((plan) => ({
      ...plan,
      version: plan.version ?? Date.parse(plan.updatedAt),
    })),
);
