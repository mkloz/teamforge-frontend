// oxlint-disable import/no-cycle -- Recursive plan/group schemas are resolved with z.lazy.
import { z } from "zod";
import {
  costTypeSchema,
  locationModeSchema,
  planCategorySchema,
  planProposalFieldSchema,
  planProposalStatusSchema,
  planProposalVoteSchema,
  planStatusSchema,
} from "./enums";
import type { Group } from "./group";
import { groupSchema } from "./group";

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
