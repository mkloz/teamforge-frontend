import { z } from "zod";

const operationalFactSchema = z.object({
  detail: z.string().nullable(),
  label: z.string(),
  requiredAction: z.string().nullable(),
  state: z.string(),
});

export const planOperationalParticipantScopeSchema = z.enum([
  "OWNER",
  "MEMBER",
  "GUEST",
  "INVITEE",
  "NONE",
]);

export const planParticipantPlaceSchema = z.object({
  assignmentStatus: z
    .enum(["HELD", "OCCUPIED", "RELEASED", "EXPIRED"])
    .nullable(),
  capabilities: z.record(z.string(), z.boolean()),
  id: z.string(),
  offerExpiresAt: z.string().datetime().nullable(),
  offerId: z.string().nullable(),
  ordinal: z.number().int().positive().nullable(),
  participantId: z.string().nullable(),
  participantName: z.string().nullable(),
  participantScope: planOperationalParticipantScopeSchema.nullable(),
  state: z.enum([
    "HELD",
    "OCCUPIED",
    "OPEN",
    "PENDING_INVITE",
    "RELEASED",
    "UNAVAILABLE",
    "WAITLISTED",
  ]),
});

export const planOperationalStateSchema = z.object({
  attendance: operationalFactSchema,
  capacity: operationalFactSchema,
  commitment: operationalFactSchema,
  location: operationalFactSchema,
  logistics: operationalFactSchema,
  materialRevision: z.number().int().positive(),
  overall: z.enum([
    "READY",
    "WAITING",
    "ACTION_REQUIRED",
    "BLOCKED",
    "COMPLETE",
  ]),
  places: z.array(planParticipantPlaceSchema),
  planId: z.string(),
  planRevision: z.number().int().positive(),
  recovery: operationalFactSchema,
  schedule: operationalFactSchema,
  stateVersion: z.string().min(1),
  viewer: z.object({
    capabilities: z.object({
      acceptSeatOffer: z.boolean(),
      createExternalInvite: z.boolean(),
      declineSeatOffer: z.boolean(),
      joinWaitlist: z.boolean(),
      manageParticipants: z.boolean(),
      managePlan: z.boolean(),
      recordAttendance: z.boolean(),
      requestAttendanceCorrection: z.boolean(),
      setCommitment: z.boolean(),
      viewChat: z.boolean(),
      viewExactLocation: z.boolean(),
      viewRoster: z.boolean(),
      withdrawGuest: z.boolean(),
    }),
    commitmentIsCurrent: z.boolean(),
    commitmentState: z.string().nullable(),
    participantScope: planOperationalParticipantScopeSchema,
    requiredAction: z.string().nullable(),
    seatState: z.string().nullable(),
  }),
});

export const planOperationalSummarySchema = z.object({
  materialRevision: z.number().int().positive(),
  overall: planOperationalStateSchema.shape.overall,
  participantScope: planOperationalParticipantScopeSchema,
  requiredAction: z.string().nullable(),
  stateVersion: z.string().min(1),
  unresolvedFactLabels: z.array(z.string()),
});

export type PlanOperationalState = z.infer<typeof planOperationalStateSchema>;
export type PlanParticipantPlace = z.infer<typeof planParticipantPlaceSchema>;
export type PlanOperationalSummary = z.infer<
  typeof planOperationalSummarySchema
>;
