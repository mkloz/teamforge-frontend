import { z } from "zod";

import {
  costTypeSchema,
  locationModeSchema,
  personalityTypeSchema,
  planScheduleModeSchema,
} from "@/shared/schemas";
import { personalityTraitScoresSchema } from "@/shared/schemas/public-personality-profile";

export const forgeProposalStateSchema = z.enum([
  "OPEN",
  "FORMING",
  "FORMED",
  "FAILED_QUORUM",
  "CANCELLED",
  "EXPIRED",
]);

export const forgeProposalSeatDecisionSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "WITHDRAWN",
]);

export const forgeProposalSeatDispositionSchema = z.enum([
  "ACTIVE",
  "RELEASED",
  "INELIGIBLE",
  "EXPIRED",
  "SAFETY_CANCELLED",
  "FORMED",
]);

export const forgeProposalSeatRoleSchema = z.enum(["REQUESTER", "CANDIDATE"]);

export const forgeProposalScopeSchema = z.enum(["LOCAL", "ONLINE"]);

const proposalInterestSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).max(80),
    slug: z.string().min(1).max(80),
  })
  .strict();

const proposalActivitySchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(140),
    description: z.string().max(1000).nullable(),
    interests: z.array(proposalInterestSchema).max(20),
  })
  .strict();

const proposalProfileSchema = z
  .object({
    name: z.string().min(1).max(120),
    avatar: z.string().nullable(),
    age: z.number().int().min(18).max(120).nullable(),
    city: z.string().max(100).nullable(),
    personalityType: personalityTypeSchema,
    ocean: personalityTraitScoresSchema.strict(),
    interests: z.array(proposalInterestSchema).max(50),
  })
  .strict();

const compatibilityWithViewerSchema = z
  .object({
    score: z.number().int().min(0).max(100),
    explanationCodes: z.array(z.string().min(1).max(80)).max(8),
  })
  .strict();

const proposalSeatSchema = z
  .object({
    seatId: z.string().min(1),
    userId: z.string().min(1),
    role: forgeProposalSeatRoleSchema,
    profile: proposalProfileSchema,
    compatibilityWithViewer: compatibilityWithViewerSchema.nullable(),
  })
  .strict();

const proposalViewerSchema = z
  .object({
    seatId: z.string().min(1),
    userId: z.string().min(1),
    role: forgeProposalSeatRoleSchema,
    decision: forgeProposalSeatDecisionSchema,
    disposition: forgeProposalSeatDispositionSchema,
  })
  .strict();

export const forgeProposalSchema = z
  .object({
    id: z.string().min(1),
    requestId: z.string().min(1),
    state: forgeProposalStateSchema,
    deadlineAt: z.string().datetime(),
    targetGroupSize: z.number().int(),
    minimumGroupSize: z.number().int(),
    activity: proposalActivitySchema,
    scope: forgeProposalScopeSchema,
    scheduleMode: planScheduleModeSchema,
    dateTime: z.string().datetime().nullable(),
    areaLabel: z.string().min(1).max(100).nullable(),
    locationMode: locationModeSchema,
    cost: costTypeSchema,
    costAmount: z.number().nonnegative().nullable(),
    costDetails: z.string().max(250).nullable(),
    viewer: proposalViewerSchema,
    seats: z.array(proposalSeatSchema).length(4),
  })
  .strict()
  .superRefine((proposal, context) => {
    validateGroupSize(proposal, context);
    validateSchedule(proposal, context);
    validateViewerSeat(proposal, context);
  });

export const currentForgeProposalResponseSchema = z
  .object({
    proposal: forgeProposalSchema.nullable(),
  })
  .strict();

function validateGroupSize(
  proposal: z.infer<typeof forgeProposalSchema>,
  context: z.RefinementCtx,
) {
  if (proposal.targetGroupSize !== 4 || proposal.minimumGroupSize !== 3) {
    context.addIssue({
      code: "custom",
      message:
        "Automatic group proposals must target four people and allow three.",
      path: ["targetGroupSize"],
    });
  }

  if (proposal.seats.length > proposal.targetGroupSize) {
    context.addIssue({
      code: "custom",
      message: "The roster cannot exceed the proposal target size.",
      path: ["seats"],
    });
  }
}

function validateSchedule(
  proposal: z.infer<typeof forgeProposalSchema>,
  context: z.RefinementCtx,
) {
  const hasFixedDate = proposal.dateTime !== null;

  if (proposal.scheduleMode === "FIXED" && !hasFixedDate) {
    context.addIssue({
      code: "custom",
      message: "A fixed proposal must include its date and time.",
      path: ["dateTime"],
    });
  }

  if (proposal.scheduleMode === "TO_BE_DECIDED" && hasFixedDate) {
    context.addIssue({
      code: "custom",
      message:
        "A decide-together proposal cannot include a fixed date and time.",
      path: ["dateTime"],
    });
  }
}

function validateViewerSeat(
  proposal: z.infer<typeof forgeProposalSchema>,
  context: z.RefinementCtx,
) {
  const viewerSeat = proposal.seats.find(
    (seat) => seat.seatId === proposal.viewer.seatId,
  );

  if (
    !viewerSeat ||
    viewerSeat.userId !== proposal.viewer.userId ||
    viewerSeat.role !== proposal.viewer.role
  ) {
    context.addIssue({
      code: "custom",
      message: "The viewer must have one corresponding proposal seat.",
      path: ["viewer"],
    });
    return;
  }

  for (const [index, seat] of proposal.seats.entries()) {
    const isViewer = seat.seatId === proposal.viewer.seatId;
    const hasViewerScore = seat.compatibilityWithViewer !== null;

    if (isViewer === hasViewerScore) {
      context.addIssue({
        code: "custom",
        message: isViewer
          ? "The viewer seat cannot include a self-compatibility score."
          : "Every other seat must include only its compatibility with the viewer.",
        path: ["seats", index, "compatibilityWithViewer"],
      });
    }
  }
}

export type ForgeProposal = z.infer<typeof forgeProposalSchema>;
export type ForgeProposalState = z.infer<typeof forgeProposalStateSchema>;
export type ForgeProposalSeatDecision = z.infer<
  typeof forgeProposalSeatDecisionSchema
>;
export type ForgeProposalSeatDisposition = z.infer<
  typeof forgeProposalSeatDispositionSchema
>;
export type ForgeProposalSeatRole = z.infer<typeof forgeProposalSeatRoleSchema>;
export type ForgeProposalSeat = ForgeProposal["seats"][number];
export type CurrentForgeProposalResponse = z.infer<
  typeof currentForgeProposalResponseSchema
>;
