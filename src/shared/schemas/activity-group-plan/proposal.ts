import { z } from "zod";
import {
  planProposalFieldSchema,
  planProposalStatusSchema,
  planProposalVoteSchema,
} from "@/shared/schemas/enums";

const planProposalShape = z.object({
  id: z.string(),
  field: planProposalFieldSchema,
  currentValue: z.string().nullable(),
  proposedValue: z.string(),
  status: planProposalStatusSchema,
  basePlanRevision: z.number().int().nonnegative(),
  approvalThreshold: z.number().int().positive(),
  activeApprovalCount: z.number().int().nonnegative(),
  eligibleVoterCount: z.number().int().nonnegative(),
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
