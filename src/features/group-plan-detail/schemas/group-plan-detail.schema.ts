import { z } from "zod";
import {
  activityAccessSchema,
  activityVisibilitySchema,
  costTypeSchema,
  groupRoleSchema,
  groupStatusSchema,
  locationModeSchema,
  onlineStatusSchema,
  personalityTypeSchema,
  planCategorySchema,
  planNextRequiredActionSchema,
  planScheduleModeSchema,
  planStatusSchema,
} from "@/shared/schemas/enums";
import { exploreInterestSchema } from "@/shared/schemas/explore";
import { groupGovernanceSchema } from "@/shared/schemas/group-governance";
import { imageMediaSchema } from "@/shared/schemas/media";
import { planProposalSchema } from "@/shared/schemas/plan";
import { reputationSummarySchema } from "@/shared/schemas/reputation";

const groupPlanViewerRelationshipSchema = z.enum([
  "NOT_MEMBER",
  "REQUESTED",
  "INVITED",
  "MEMBER",
  "MODERATOR",
  "ADMIN",
  "FORMER_MEMBER",
  "RESTRICTED",
]);

const groupPlanJoinDisabledReasonSchema = z
  .enum([
    "FULL",
    "DISBANDED",
    "COMPLETED",
    "PRIVATE",
    "ALREADY_MEMBER",
    "REQUEST_PENDING",
    "FIXED_MEMBERSHIP",
  ])
  .nullable();

const groupPlanFitSignalSchema = z.object({
  key: z.enum([
    "SHARED_INTERESTS",
    "SOCIAL_PACE",
    "LOCATION",
    "KNOWN_CONNECTION",
    "RELIABILITY",
    "LIFE_STAGE",
  ]),
  label: z.string(),
  detail: z.string(),
  strength: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const groupPlanDetailSchema = z.object({
  governance: groupGovernanceSchema.nullish(),
  group: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    avatar: z.string().nullable(),
    avatarMedia: imageMediaSchema.nullable().optional(),
    status: groupStatusSchema,
    access: activityAccessSchema,
    visibility: activityVisibilitySchema,
    maxMembers: z.number(),
    activeMembersCount: z.number(),
    pendingInvitationsCount: z.number(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  activity: z.object({
    id: z.string(),
    title: z.string(),
    city: z.string().nullable(),
    interests: z.array(exploreInterestSchema),
  }),
  plan: z
    .object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      category: planCategorySchema,
      coverImage: z.string().nullable(),
      coverImageMedia: imageMediaSchema.nullable().optional(),
      status: planStatusSchema,
      scheduleMode: planScheduleModeSchema.nullish(),
      revision: z.number().int().nonnegative(),
      materialRevision: z.number().int().positive().default(1),
      seatRecoveryEnabled: z.boolean().default(false),
      isScheduleResolved: z.boolean(),
      isLocationResolved: z.boolean(),
      nextRequiredAction: planNextRequiredActionSchema.nullable(),
      dateTime: z.string().datetime().nullable(),
      timeZoneId: z.string().nullable(),
      localStartDate: z.string().nullable(),
      localStartTime: z.string().nullable(),
      scheduleFold: z.number().int().min(0).max(1).nullable(),
      durationMinutes: z.number().int().positive().nullable(),
      endAt: z.string().datetime().nullable(),
      calendarSequence: z.number().int().nonnegative(),
      locationMode: locationModeSchema,
      location: z.string().nullable(),
      locationLat: z.number().nullable(),
      locationLng: z.number().nullable(),
      cost: costTypeSchema,
      costAmount: z.number().nullable(),
      costDetails: z.string().nullable(),
      costAmountDecimal: z.string().nullable().default(null),
      costCurrency: z.string().length(3).nullable().default(null),
      costAccuracy: z.enum(["UNKNOWN", "ESTIMATE", "EXACT"]).default("UNKNOWN"),
      costBasis: z.enum(["UNKNOWN", "TOTAL", "PER_PERSON"]).default("UNKNOWN"),
      depositAmountDecimal: z.string().nullable().default(null),
      refundPolicy: z.string().nullable().default(null),
      purchaseResponsibility: z
        .enum(["UNKNOWN", "INDIVIDUAL", "ORGANIZER", "SHARED"])
        .default("UNKNOWN"),
      costCheckedAt: z.string().datetime().nullable().default(null),
      costLegacyUnknown: z.boolean().default(true),
      accessFacts: z
        .array(
          z.object({
            factKey: z.string(),
            value: z.enum(["YES", "NO", "UNKNOWN"]),
            source: z.string(),
            checkedAt: z.string().datetime(),
            correctionRoute: z.string(),
          }),
        )
        .default([]),
    })
    .nullable(),
  planHistory: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      category: planCategorySchema,
      scheduleMode: planScheduleModeSchema.nullish(),
      dateTime: z.string().datetime().nullable(),
      coverImage: z.string().nullable(),
      coverImageMedia: imageMediaSchema.nullable().optional(),
      status: planStatusSchema,
      location: z.string().nullable(),
    }),
  ),
  members: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
      avatarMedia: imageMediaSchema.nullable().optional(),
      personalityType: personalityTypeSchema.nullable(),
      trustScore: z.number().optional(),
      reputationSummary: reputationSummarySchema.optional(),
      compatibilityScore: z.number().nullable(),
      role: groupRoleSchema,
      joinedAt: z.string().datetime().nullable(),
      knownConnection: z.string().nullable().optional(),
      onlineStatus: onlineStatusSchema.optional(),
      lastSeenAt: z.string().datetime().nullable(),
    }),
  ),
  pendingInvitations: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
      avatarMedia: imageMediaSchema.nullable().optional(),
      personalityType: personalityTypeSchema.nullable(),
      trustScore: z.number().optional(),
      reputationSummary: reputationSummarySchema.optional(),
      createdAt: z.string().datetime(),
    }),
  ),
  viewer: z.object({
    userId: z.string(),
    relationship: groupPlanViewerRelationshipSchema,
    role: groupRoleSchema.nullable(),
    canJoin: z.boolean(),
    canRequestToJoin: z.boolean(),
    canCancelRequest: z.boolean(),
    canOpenActivity: z.boolean(),
    canSuggestPlanChange: z.boolean(),
    canVoteOnPlanChange: z.boolean(),
    canInviteMembers: z.boolean(),
    canLeaveGroup: z.boolean(),
    canManageGroup: z.boolean(),
    pendingInviteId: z.string().nullable(),
    joinDisabledReason: groupPlanJoinDisabledReasonSchema,
  }),
  fit: z
    .object({
      totalScore: z.number().nullable(),
      summary: z.string(),
      signals: z.array(groupPlanFitSignalSchema),
    })
    .nullable(),
  planning: z.object({
    pendingProposalCount: z.number(),
    visibility: z.enum(["PUBLIC_SUMMARY", "MEMBER_ONLY", "HIDDEN"]),
    proposals: z.array(planProposalSchema),
  }),
  timestamps: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
});

export type GroupPlanDetail = z.infer<typeof groupPlanDetailSchema>;
export type GroupPlanDetailMember = GroupPlanDetail["members"][number];
export type GroupPlanDetailPendingInvitation =
  GroupPlanDetail["pendingInvitations"][number];
export type GroupPlanFitSignal = z.infer<typeof groupPlanFitSignalSchema>;
