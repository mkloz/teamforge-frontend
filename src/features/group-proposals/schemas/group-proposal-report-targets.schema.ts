import { z } from "zod";

const groupProposalReportTargetSchema = z
  .object({
    seatId: z.string().min(1),
    displayName: z.string().trim().min(1).max(120),
    avatar: z.string().max(2048).nullable(),
  })
  .strict();

export const groupProposalReportTargetsSchema = z
  .object({
    proposalId: z.string().min(1),
    proposalVersion: z.number().int().positive(),
    reportableUntil: z.string().datetime(),
    targets: z.array(groupProposalReportTargetSchema).max(7),
  })
  .strict()
  .superRefine((value, context) => {
    const uniqueSeatIds = new Set(value.targets.map((target) => target.seatId));

    if (uniqueSeatIds.size !== value.targets.length) {
      context.addIssue({
        code: "custom",
        message: "Proposal report targets must use unique seat IDs.",
        path: ["targets"],
      });
    }
  });

export type GroupProposalReportTargets = z.infer<
  typeof groupProposalReportTargetsSchema
>;
