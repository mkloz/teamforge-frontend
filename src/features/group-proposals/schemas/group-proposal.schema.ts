import { z } from "zod";

import {
  costTypeSchema,
  locationModeSchema,
  personalityTypeSchema,
  planScheduleModeSchema,
} from "@/shared/schemas";

export const groupProposalStateSchema = z.enum([
  "OPEN",
  "FORMING",
  "FORMED",
  "FAILED_QUORUM",
  "CANCELLED",
  "EXPIRED",
]);

export const groupProposalSeatDecisionSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "WITHDRAWN",
]);

export const groupProposalSeatDispositionSchema = z.enum([
  "ACTIVE",
  "RELEASED",
  "INELIGIBLE",
  "EXPIRED",
  "SAFETY_CANCELLED",
  "FORMED",
]);

export const groupProposalSeatRoleSchema = z.enum(["REQUESTER", "CANDIDATE"]);

export const groupProposalScopeSchema = z.enum(["LOCAL", "ONLINE"]);

export const groupProposalDecisionPolicySchema = z.literal(
  "group-proposal-decision-v1",
);
export const groupProposalRecoveryPolicySchema = z.literal(
  "group-proposal-recovery-v1",
);

export const groupProposalRecoveryCommandSchema = z
  .object({
    policyVersion: groupProposalRecoveryPolicySchema,
    expectedVersion: z.number().int().positive(),
  })
  .strict();

export const groupProposalDeclineReasonSchema = z.enum([
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

export const groupProposalOpeningStateSchema = z.enum([
  "OPEN",
  "APPLICATION_PENDING",
  "FINAL_PROPOSAL_CREATED",
  "FILLED",
  "EXPIRED",
  "CANCELLED",
]);

const groupProposalRecoverySummarySchema = z.discriminatedUnion(
  "viewerStatus",
  [
    z
      .object({
        viewerStatus: z.literal("ORGANIZER_ACTION"),
        holdUntil: z.string().datetime(),
        eligible: z.boolean(),
        openingId: z.string().min(1).nullable(),
        openingState: groupProposalOpeningStateSchema.nullable(),
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

export const groupProposalDecisionCommandSchema = z
  .object({
    policyVersion: groupProposalDecisionPolicySchema,
    expectedProposalVersion: z.number().int().positive(),
    expectedSeatDecisionRevision: z.number().int().nonnegative(),
  })
  .strict();

export const groupProposalDeclineCommandSchema = z
  .object({
    policyVersion: groupProposalDecisionPolicySchema,
    expectedProposalVersion: z.number().int().positive(),
    expectedSeatDecisionRevision: z.number().int().nonnegative(),
    reason: groupProposalDeclineReasonSchema.optional(),
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
    personalityType: personalityTypeSchema.nullable(),
    ocean: z
      .object({
        openness: z.number().int().min(0).max(100).nullable(),
        conscientiousness: z.number().int().min(0).max(100).nullable(),
        extraversion: z.number().int().min(0).max(100).nullable(),
        agreeableness: z.number().int().min(0).max(100).nullable(),
        neuroticism: z.number().int().min(0).max(100).nullable(),
      })
      .strict(),
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
    role: groupProposalSeatRoleSchema,
    profile: proposalProfileSchema,
    compatibilityWithViewer: compatibilityWithViewerSchema.nullable(),
  })
  .strict();

const proposalViewerSchema = z
  .object({
    seatId: z.string().min(1),
    userId: z.string().min(1),
    role: groupProposalSeatRoleSchema,
    decision: groupProposalSeatDecisionSchema,
    disposition: groupProposalSeatDispositionSchema,
    decisionRevision: z.number().int().nonnegative(),
  })
  .strict();

const groupProposalProducerSchema = z
  .object({
    id: z.string().min(1),
    requestId: z.string().min(1),
    matchingStrategy: z
      .enum(["FULL_COMPATIBILITY", "INTRODUCTORY_INTERESTS"])
      .default("FULL_COMPATIBILITY"),
    policyVersion: groupProposalDecisionPolicySchema,
    version: z.number().int().positive(),
    state: groupProposalStateSchema,
    deadlineAt: z.string().datetime(),
    requestedMinimumGroupSize: z.number().int().min(3).max(8),
    requestedMaximumGroupSize: z.number().int().min(3).max(8),
    selectedGroupSize: z.number().int().min(3).max(8),
    targetGroupSize: z.number().int().min(3).max(8),
    minimumGroupSize: z.number().int().min(3).max(8),
    activity: proposalActivitySchema,
    scope: groupProposalScopeSchema,
    scheduleMode: planScheduleModeSchema,
    dateTime: z.string().datetime().nullable(),
    areaLabel: z.string().min(1).max(100).nullable(),
    locationMode: locationModeSchema,
    cost: costTypeSchema,
    costAmount: z.number().nonnegative().nullable(),
    costDetails: z.string().max(250).nullable(),
    formedResources: formedResourcesSchema.nullable(),
    recovery: groupProposalRecoverySummarySchema
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

const canonicalGroupProposalSchema = groupProposalProducerSchema.transform(
  ({
    minimumGroupSize: _minimumGroupSize,
    targetGroupSize: _targetGroupSize,
    ...proposal
  }) => proposal,
);

export const groupProposalSchema = canonicalGroupProposalSchema;

export const currentGroupProposalResponseSchema = z
  .object({
    proposal: groupProposalSchema.nullable(),
  })
  .strict();

export const groupProposalDecisionReceiptSchema = z
  .object({
    proposalId: z.string().min(1),
    proposalState: groupProposalStateSchema,
    proposalVersion: z.number().int().positive(),
    viewerDecision: groupProposalSeatDecisionSchema,
    viewerDisposition: groupProposalSeatDispositionSchema,
    viewerDecisionRevision: z.number().int().nonnegative(),
    formedResources: formedResourcesSchema.nullable(),
  })
  .strict()
  .superRefine((receipt, context) => {
    validateFormedResources(receipt, context);
  });

function validateFormedResources(
  value: {
    state?: z.infer<typeof groupProposalStateSchema>;
    proposalState?: z.infer<typeof groupProposalStateSchema>;
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
  proposal: z.infer<typeof groupProposalProducerSchema>,
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

  if (proposal.targetGroupSize !== proposal.selectedGroupSize) {
    context.addIssue({
      code: "custom",
      message: "The producer target size must mirror the selected group size.",
      path: ["targetGroupSize"],
    });
  }

  if (proposal.minimumGroupSize !== proposal.requestedMinimumGroupSize) {
    context.addIssue({
      code: "custom",
      message:
        "The producer minimum size must mirror the requested minimum group size.",
      path: ["minimumGroupSize"],
    });
  }
}

function validateSchedule(
  proposal: z.infer<typeof groupProposalProducerSchema>,
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
  proposal: z.infer<typeof groupProposalProducerSchema>,
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

    if (proposal.matchingStrategy === "INTRODUCTORY_INTERESTS") {
      if (hasViewerScore) {
        context.addIssue({
          code: "custom",
          message: "Introductory proposals do not expose compatibility scores.",
          path: ["seats", index, "compatibilityWithViewer"],
        });
      }
      continue;
    }

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

export type GroupProposal = z.infer<typeof groupProposalSchema>;
export type GroupProposalState = z.infer<typeof groupProposalStateSchema>;
export type GroupProposalSeatDecision = z.infer<
  typeof groupProposalSeatDecisionSchema
>;
export type GroupProposalSeatDisposition = z.infer<
  typeof groupProposalSeatDispositionSchema
>;
export type GroupProposalSeat = GroupProposal["seats"][number];
export type GroupProposalDecisionPolicy = z.infer<
  typeof groupProposalDecisionPolicySchema
>;
export type GroupProposalRecoveryCommand = z.infer<
  typeof groupProposalRecoveryCommandSchema
>;
export type GroupProposalDeclineReason = z.infer<
  typeof groupProposalDeclineReasonSchema
>;
export type GroupProposalDecisionCommand = z.infer<
  typeof groupProposalDecisionCommandSchema
>;
export type GroupProposalDeclineCommand = z.infer<
  typeof groupProposalDeclineCommandSchema
>;
export type GroupProposalDecisionReceipt = z.infer<
  typeof groupProposalDecisionReceiptSchema
>;
export type CurrentGroupProposalResponse = z.infer<
  typeof currentGroupProposalResponseSchema
>;
