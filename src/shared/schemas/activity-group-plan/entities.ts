import { z } from "zod";
import {
  activityData,
  groupData,
  groupMemberData,
  planShape,
} from "@/shared/schemas/activity-group-plan/data";
import {
  type PlanProposal,
  planProposalSchema,
} from "@/shared/schemas/activity-group-plan/proposal";
import type { Chat } from "@/shared/schemas/chat";
import { chatSchema } from "@/shared/schemas/chat";
import type { Interest, User } from "@/shared/schemas/user";
import { interestSchema, userSchema } from "@/shared/schemas/user";

export type Activity = z.infer<z.ZodObject<typeof activityData>> & {
  creator?: User;
  interests?: Interest[];
  group?: Group | null;
};

export type GroupMember = z.infer<z.ZodObject<typeof groupMemberData>> & {
  user?: User;
  group?: Group;
};

export type Group = z.infer<z.ZodObject<typeof groupData>> & {
  activity?: Activity;
  members?: GroupMember[];
  plan?: Plan;
  chat?: Chat;
};

export type Plan = z.infer<typeof planShape> & {
  version: number;
  group?: Group;
  proposals?: PlanProposal[];
};

export const activitySchema: z.ZodSchema<Activity> = z.lazy(() =>
  z.object(activityData).extend({
    creator: userSchema.optional(),
    interests: z.array(interestSchema).optional(),
    group: groupSchema.nullable().optional(),
  }),
);

const groupMemberSchema: z.ZodSchema<GroupMember> = z.lazy(() =>
  z.object(groupMemberData).extend({
    user: userSchema.optional(),
    group: groupSchema.optional(),
  }),
);

const groupSchema: z.ZodSchema<Group> = z.lazy(() =>
  z.object(groupData).extend({
    activity: activitySchema.optional(),
    members: z.array(groupMemberSchema).optional(),
    plan: planSchema.optional(),
    chat: chatSchema.optional(),
  }),
);

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
