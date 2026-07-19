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
  "RECOVERY_ELIGIBLE",
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

export const forgeProposalDecisionPolicySchema = z.literal(
  "forge-proposal-decision-v1",
);
export const forgeProposalRecoveryPolicySchema = z.literal(
  "forge-proposal-recovery-v1",
);

export const forgeProposalRecoveryCommandSchema = z
  .object({
    policyVersion: forgeProposalRecoveryPolicySchema,
    expectedVersion: z.number().int().positive(),
  })
  .strict();

export const forgeProposalDeclineReasonSchema = z.enum([
  "ACTIVITY_NOT_FOR_ME",
  "FIXED_TIME_DOES_NOT_WORK",
  "AREA_DOES_NOT_WORK",
  "NOT_THIS_GROUP",
  "TAKING_A_BREAK",
  "PREFER_NOT_TO_SAY",
]);

const formedResourcesSchema = z
  .object({
    groupId: z.string().min(1),
    planId: z.string().min(1),
    chatId: z.string().min(1),
  })
  .strict();

export const forgeProposalOpeningStateSchema = z.enum([
  "OPEN",
  "APPLICATION_PENDING",
  "FINAL_PROPOSAL_CREATED",
  "FILLED",
  "EXPIRED",
  "CANCELLED",
]);

const forgeProposalRecoverySummarySchema = z.discriminatedUnion(
  "viewerStatus",
  [
    z
      .object({
        viewerStatus: z.literal("ORGANIZER_ACTION"),
        holdUntil: z.string().datetime(),
        eligible: z.boolean(),
        openingId: z.string().min(1).nullable(),
        openingState: forgeProposalOpeningStateSchema.nullable(),
        openingVersion: z.number().int().positive().nullable(),
        openingExpiresAt: z.string().datetime().nullable(),
        successorProposalId: z.string().min(1).nullable(),
      })
      .strict(),
    z
      .object({
        viewerStatus: z.literal("WAITING_FOR_RECOVERY"),
        holdUntil: z.string().datetime(),
        eligible: z.literal(false),
        openingId: z.null(),
        openingState: z.null(),
        openingVersion: z.null(),
        openingExpiresAt: z.null(),
        successorProposalId: z.null(),
      })
      .strict(),
  ],
);

export const forgeProposalDecisionCommandSchema = z
  .object({
    policyVersion: forgeProposalDecisionPolicySchema,
    expectedProposalVersion: z.number().int().positive(),
    expectedSeatDecisionRevision: z.number().int().nonnegative(),
  })
  .strict();

export const forgeProposalDeclineCommandSchema = z
  .object({
    policyVersion: forgeProposalDecisionPolicySchema,
    expectedProposalVersion: z.number().int().positive(),
    expectedSeatDecisionRevision: z.number().int().nonnegative(),
    reason: forgeProposalDeclineReasonSchema.optional(),
  })
  .strict();

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
    decisionRevision: z.number().int().nonnegative(),
  })
  .strict();

const canonicalForgeProposalSchema = z
  .object({
    id: z.string().min(1),
    requestId: z.string().min(1),
    policyVersion: forgeProposalDecisionPolicySchema,
    version: z.number().int().positive(),
    state: forgeProposalStateSchema,
    deadlineAt: z.string().datetime(),
    requestedMinimumGroupSize: z.number().int().min(3).max(8),
    requestedMaximumGroupSize: z.number().int().min(3).max(8),
    selectedGroupSize: z.number().int().min(3).max(8),
    activity: proposalActivitySchema,
    scope: forgeProposalScopeSchema,
    scheduleMode: planScheduleModeSchema,
    dateTime: z.string().datetime().nullable(),
    areaLabel: z.string().min(1).max(100).nullable(),
    locationMode: locationModeSchema,
    cost: costTypeSchema,
    costAmount: z.number().nonnegative().nullable(),
    costDetails: z.string().max(250).nullable(),
    formedResources: formedResourcesSchema.nullable(),
    recovery: forgeProposalRecoverySummarySchema
      .nullish()
      .transform((recovery) => recovery ?? null),
    viewer: proposalViewerSchema,
    seats: z.array(proposalSeatSchema).min(3).max(8),
  })
  .strict()
  .superRefine((proposal, context) => {
    validateGroupSize(proposal, context);
    validateSchedule(proposal, context);
    validateViewerSeat(proposal, context);
    validateFormedResources(proposal, context);
  });

export const forgeProposalSchema = z.preprocess(
  normalizeLegacyProposalGroupSizes,
  canonicalForgeProposalSchema,
);

export const currentForgeProposalResponseSchema = z
  .object({
    proposal: forgeProposalSchema.nullable(),
  })
  .strict();

export const forgeProposalDecisionReceiptSchema = z
  .object({
    proposalId: z.string().min(1),
    proposalState: forgeProposalStateSchema,
    proposalVersion: z.number().int().positive(),
    viewerDecision: forgeProposalSeatDecisionSchema,
    viewerDisposition: forgeProposalSeatDispositionSchema,
    viewerDecisionRevision: z.number().int().nonnegative(),
    formedResources: formedResourcesSchema.nullable(),
  })
  .strict()
  .superRefine((receipt, context) => {
    validateFormedResources(receipt, context);
  });

function validateFormedResources(
  value: {
    state?: z.infer<typeof forgeProposalStateSchema>;
    proposalState?: z.infer<typeof forgeProposalStateSchema>;
    formedResources: z.infer<typeof formedResourcesSchema> | null;
  },
  context: z.RefinementCtx,
) {
  const state = value.state ?? value.proposalState;
  const shouldHaveResources = state === "FORMED";

  if (shouldHaveResources !== (value.formedResources !== null)) {
    context.addIssue({
      code: "custom",
      message:
        state === "FORMED"
          ? "A formed proposal must include its group resources."
          : "Group resources are only available after the proposal forms.",
      path: ["formedResources"],
    });
  }
}

function validateGroupSize(
  proposal: z.infer<typeof canonicalForgeProposalSchema>,
  context: z.RefinementCtx,
) {
  if (proposal.requestedMinimumGroupSize > proposal.requestedMaximumGroupSize) {
    context.addIssue({
      code: "custom",
      message: "The requested minimum cannot exceed the preferred maximum.",
      path: ["requestedMinimumGroupSize"],
    });
  }

  if (
    proposal.selectedGroupSize < proposal.requestedMinimumGroupSize ||
    proposal.selectedGroupSize > proposal.requestedMaximumGroupSize
  ) {
    context.addIssue({
      code: "custom",
      message: "The selected size must stay within the requested range.",
      path: ["selectedGroupSize"],
    });
  }

  if (proposal.seats.length !== proposal.selectedGroupSize) {
    context.addIssue({
      code: "custom",
      message: "The roster must contain the selected number of people.",
      path: ["seats"],
    });
  }
}

function normalizeLegacyProposalGroupSizes(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const proposal: Record<string, unknown> = { ...value };
  const legacyMinimum = proposal.minimumGroupSize;
  const legacyTarget = proposal.targetGroupSize;

  proposal.requestedMinimumGroupSize ??= legacyMinimum;
  proposal.requestedMaximumGroupSize ??= legacyTarget;
  proposal.selectedGroupSize ??= legacyTarget;
  delete proposal.minimumGroupSize;
  delete proposal.targetGroupSize;

  return proposal;
}

function validateSchedule(
  proposal: z.infer<typeof canonicalForgeProposalSchema>,
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
  proposal: z.infer<typeof canonicalForgeProposalSchema>,
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
export type ForgeProposalDecisionPolicy = z.infer<
  typeof forgeProposalDecisionPolicySchema
>;
export type ForgeProposalRecoveryCommand = z.infer<
  typeof forgeProposalRecoveryCommandSchema
>;
export type ForgeProposalRecoverySummary = z.infer<
  typeof forgeProposalRecoverySummarySchema
>;
export type ForgeProposalDeclineReason = z.infer<
  typeof forgeProposalDeclineReasonSchema
>;
export type ForgeProposalDecisionCommand = z.infer<
  typeof forgeProposalDecisionCommandSchema
>;
export type ForgeProposalDeclineCommand = z.infer<
  typeof forgeProposalDeclineCommandSchema
>;
export type ForgeProposalDecisionReceipt = z.infer<
  typeof forgeProposalDecisionReceiptSchema
>;
export type CurrentForgeProposalResponse = z.infer<
  typeof currentForgeProposalResponseSchema
>;
