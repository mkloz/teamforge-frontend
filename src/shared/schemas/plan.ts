import { z } from "zod";
import {
  planCategorySchema,
  planStatusSchema,
  locationModeSchema,
  costTypeSchema,
} from "./enums";
import type { Group } from "./group";
import { groupSchema } from "./group";

const planProposalData = {
  id: z.string(),
  field: z.string(),
  currentValue: z.string().nullable(),
  proposedValue: z.string(),
  status: z.string(),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullable(),
};

export type PlanProposal = z.infer<z.ZodObject<typeof planProposalData>>;

export const planProposalSchema: z.ZodSchema<PlanProposal> = z.lazy(() =>
  z.object(planProposalData),
);

const planCommentData = {
  id: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  editedAt: z.string().datetime().nullable(),
};

export type PlanComment = z.infer<z.ZodObject<typeof planCommentData>>;

export const planCommentSchema: z.ZodSchema<PlanComment> = z.lazy(() =>
  z.object(planCommentData),
);

const planData = {
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
  groupId: z.string(),
};

export type Plan = z.infer<z.ZodObject<typeof planData>> & {
  group?: Group;
  proposals?: PlanProposal[];
  comments?: PlanComment[];
};

export const planSchema: z.ZodSchema<Plan> = z.lazy(() =>
  z.object(planData).extend({
    group: groupSchema.optional(),
    proposals: z.array(planProposalSchema).optional(),
    comments: z.array(planCommentSchema).optional(),
  }),
);
