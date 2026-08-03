import { z } from "zod";

export const externalInvitePreviewSchema = z.object({
  category: z.string(),
  dateTime: z.string().datetime().nullable(),
  expiresAt: z.string().datetime(),
  groupName: z.string(),
  locationMode: z.string(),
  planTitle: z.string(),
  requiresAuthentication: z.literal(true),
});

export const externalInviteClaimSchema = z.object({
  claimId: z.string(),
  groupId: z.string(),
  participantScope: z.enum(["GROUP_MEMBER", "PLAN_GUEST"]),
  planId: z.string(),
  redirectPath: z.string(),
});

export const createdExternalInviteSchema = z.object({
  expiresAt: z.string().datetime(),
  id: z.string(),
  planId: z.string(),
  shareUrl: z.string().url(),
});

export const externalInviteListItemSchema = z.object({
  claimCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  id: z.string(),
  status: z.enum(["ACTIVE", "EXHAUSTED", "EXPIRED", "REVOKED"]),
  useCap: z.number().int().positive(),
});

export const planGuestSummarySchema = z.object({
  acceptedAt: z.string().datetime(),
  avatar: z.string().nullable(),
  id: z.string(),
  name: z.string(),
  userId: z.string(),
});

export const guestMembershipProposalSchema = z.object({
  approvalCount: z.number().int().nonnegative(),
  expiresAt: z.string().datetime(),
  groupId: z.string(),
  guest: z.object({
    avatar: z.string().nullable(),
    id: z.string(),
    name: z.string(),
    planId: z.string(),
    userId: z.string(),
  }),
  guestAcceptedAt: z.string().datetime().nullable(),
  id: z.string(),
  proposerId: z.string(),
  rejectionCount: z.number().int().nonnegative(),
  requiredApprovals: z.number().int().nonnegative(),
  resolvedAt: z.string().datetime().nullable(),
  status: z.enum([
    "PENDING_GUEST",
    "PENDING_VOTE",
    "ACCEPTED",
    "DECLINED",
    "REJECTED",
    "EXPIRED",
    "CANCELLED",
  ]),
  viewerVote: z.enum(["APPROVE", "REJECT"]).nullable(),
});

export const ownershipTransferSchema = z
  .object({
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
    groupId: z.string(),
    id: z.string(),
    initiatorId: z.string(),
    recipientId: z.string(),
    respondedAt: z.string().datetime().nullable(),
    status: z.enum(["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELLED"]),
  })
  .nullable();

export const planGuestAccessSchema = z.object({
  accessFacts: z.array(
    z.object({
      checkedAt: z.string().datetime(),
      factKey: z.string(),
      source: z.string(),
      value: z.enum(["YES", "NO", "UNKNOWN"]),
    }),
  ),
  canUseGroupSpaces: z.boolean(),
  groupId: z.string(),
  groupName: z.string(),
  guestStatus: z
    .enum(["ACTIVE", "WITHDRAWN", "REVOKED", "COMPLETED"])
    .nullable(),
  offer: z
    .object({
      expiresAt: z.string().datetime().nullable(),
      id: z.string(),
      status: z.enum([
        "WAITING",
        "OFFERED",
        "ACCEPTED",
        "DECLINED",
        "EXPIRED",
        "CANCELLED",
      ]),
    })
    .nullable(),
  participantScope: z.enum(["GROUP_MEMBER", "PLAN_GUEST", "NONE"]),
  plan: z.object({
    category: z.string(),
    dateTime: z.string().datetime().nullable(),
    description: z.string().nullable(),
    durationMinutes: z.number().int().positive().nullable(),
    endAt: z.string().datetime().nullable(),
    id: z.string(),
    location: z.string().nullable(),
    locationMode: z.string(),
    materialRevision: z.number().int().positive(),
    status: z.string(),
    title: z.string(),
  }),
  seat: z
    .object({
      assignmentStatus: z.enum(["HELD", "OCCUPIED", "RELEASED", "EXPIRED"]),
      ordinal: z.number().int().positive(),
    })
    .nullable(),
});

export type ExternalInvitePreview = z.infer<typeof externalInvitePreviewSchema>;
export type GuestMembershipProposal = z.infer<
  typeof guestMembershipProposalSchema
>;
export type PlanGuestAccess = z.infer<typeof planGuestAccessSchema>;
