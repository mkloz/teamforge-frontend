import { z } from "zod";
import {
  activityAccessSchema,
  activityVisibilitySchema,
  costTypeSchema,
  groupRoleSchema,
  groupStatusSchema,
  locationModeSchema,
  personalityTypeSchema,
  planCategorySchema,
  planStatusSchema,
} from "@/shared/schemas/enums";
import { exploreInterestSchema } from "@/shared/schemas/explore";
import { imageMediaSchema } from "@/shared/schemas/media";
import { planProposalSchema } from "@/shared/schemas/plan";

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
      dateTime: z.string().datetime().nullable(),
      locationMode: locationModeSchema,
      location: z.string().nullable(),
      locationLat: z.number().nullable(),
      locationLng: z.number().nullable(),
      cost: costTypeSchema,
      costAmount: z.number().nullable(),
      costDetails: z.string().nullable(),
    })
    .nullable(),
  planHistory: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      category: planCategorySchema,
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
      trustScore: z.number(),
      compatibilityScore: z.number().nullable(),
      role: groupRoleSchema,
      joinedAt: z.string().datetime().nullable(),
      knownConnection: z.string().nullable().optional(),
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
export type GroupPlanFitSignal = z.infer<typeof groupPlanFitSignalSchema>;
