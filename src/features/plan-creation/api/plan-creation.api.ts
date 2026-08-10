import { z } from "zod";
import {
  automaticGroupFormationRequestCommandSchema,
  automaticGroupFormationRequestSchema,
  createAutomaticGroupFormationRequestInputSchema,
  currentAutomaticGroupFormationRequestSchema,
  type UpdateAutomaticGroupFormationRequestInput,
  updateAutomaticGroupFormationRequestInputSchema,
} from "@/features/plan-creation/schemas/automatic-group-formation-request.schema";
import { friendCompatibilityPreviewSchema } from "@/features/plan-creation/schemas/plan-creation.schemas";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { getFriendsPage as sharedGetFriendsPage } from "@/shared/api/friendship-membership-api";
import {
  getGroupById as sharedGetGroupById,
  removeGroupMember as sharedRemoveGroupMember,
  updateGroup as sharedUpdateGroup,
} from "@/shared/api/group-membership-api";
import { createInvite as sharedCreateInvite } from "@/shared/api/invite-membership-api";
import { updatePlanCoverImage as sharedUpdatePlanCoverImage } from "@/shared/api/plan-membership-api";
import {
  activitySchema,
  activityVisibilitySchema,
  costTypeSchema,
  createActivityInputSchema,
  createPaginatedSchema,
  groupFormationActivityInputSchema,
  groupFormationActivityResultSchema,
  groupFormationModeSchema,
  locationModeSchema,
  planCategorySchema,
  planScheduleModeSchema,
} from "@/shared/schemas";

const recentActivityPlanSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  category: planCategorySchema.nullable().optional(),
  scheduleMode: planScheduleModeSchema.nullish(),
  locationMode: locationModeSchema,
  location: z.string().nullable().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  cost: costTypeSchema,
  costAmount: z.number().nullable().optional(),
  costDetails: z.string().nullable().optional(),
});

const recentActivityInterestSchema = z.object({
  name: z.string(),
  slug: z.string(),
  aliases: z.array(z.string()).optional(),
});

const recentActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  visibility: activityVisibilitySchema,
  groupFormationMode: groupFormationModeSchema,
  createdAt: z.string().datetime(),
  interests: z.array(recentActivityInterestSchema).optional(),
  group: z
    .object({
      name: z.string(),
      description: z.string().nullable().optional(),
      avatar: z.string().nullable().optional(),
      maxMembers: z.number().int().nullable().optional(),
      plan: recentActivityPlanSchema.nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type RecentPlanCreationActivity = z.infer<typeof recentActivitySchema>;

export class PlanCreationApi {
  static async getCurrentAutomaticGroupFormationRequest() {
    const response = await apiClient
      .get("automatic-group-formation-requests/current")
      .json<unknown>();

    return currentAutomaticGroupFormationRequestSchema.parse(response).request;
  }

  static async createAutomaticGroupFormationRequest(
    activityId: string,
    payload: unknown,
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      `activities/${activityId}/automatic-group-formation-requests`,
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: createAutomaticGroupFormationRequestInputSchema.parse(payload),
      },
    );

    return parseJsonWithRequestId(response, (value) =>
      automaticGroupFormationRequestSchema.parse(value),
    );
  }

  static async updateAutomaticGroupFormationRequest(
    requestId: string,
    payload: UpdateAutomaticGroupFormationRequestInput,
    idempotencyKey: string,
  ) {
    const response = await apiClient.patch(
      `automatic-group-formation-requests/${requestId}`,
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: updateAutomaticGroupFormationRequestInputSchema.parse(payload),
      },
    );

    return parseJsonWithRequestId(response, (value) =>
      automaticGroupFormationRequestSchema.parse(value),
    );
  }

  static async runAutomaticGroupFormationRequestCommand(
    requestId: string,
    action: "pause" | "resume" | "cancel" | "retry",
    payload: unknown,
    idempotencyKey: string,
  ) {
    const options = {
      headers: { "Idempotency-Key": idempotencyKey },
      json: automaticGroupFormationRequestCommandSchema.parse(payload),
    };
    const response =
      action === "cancel"
        ? await apiClient.delete(
            `automatic-group-formation-requests/${requestId}`,
            options,
          )
        : await apiClient.post(
            `automatic-group-formation-requests/${requestId}/${action}`,
            options,
          );

    return parseJsonWithRequestId(response, (value) =>
      automaticGroupFormationRequestSchema.parse(value),
    );
  }

  static async getFriendsPage(page: number, search: string) {
    return sharedGetFriendsPage({
      limit: 20,
      page,
      search,
    });
  }

  static async previewFriendCompatibility(input: {
    candidateIds: string[];
    groupId?: string | null;
    groupMemberIds: string[];
  }) {
    const response = await apiClient
      .post("friends/compatibility-preview", {
        json: {
          candidateIds: input.candidateIds,
          groupMemberIds: input.groupMemberIds,
          ...(input.groupId ? { groupId: input.groupId } : {}),
        },
      })
      .json<unknown>();

    return friendCompatibilityPreviewSchema.parse(response).items;
  }

  static async getRecentActivities() {
    const response = await apiClient
      .get("activities", {
        searchParams: {
          limit: 50,
        },
      })
      .json<unknown>();

    return createPaginatedSchema(recentActivitySchema).parse(response).items;
  }

  static async createActivity(payload: unknown) {
    const response = await apiClient.post("activities", {
      json: createActivityInputSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      activitySchema.parse(value),
    );
  }

  static async groupFormationActivity(
    activityId: string,
    payload: unknown,
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      `activities/${activityId}/group-formation`,
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: groupFormationActivityInputSchema.parse(payload),
      },
    );

    return parseJsonWithRequestId(response, (value) =>
      groupFormationActivityResultSchema.parse(value),
    );
  }

  static async getGroup(groupId: string) {
    return sharedGetGroupById(groupId);
  }

  static async updateGroup(groupId: string, payload: unknown) {
    return sharedUpdateGroup(groupId, payload);
  }

  static async removeGroupMember(groupId: string, memberId: string) {
    return sharedRemoveGroupMember(groupId, memberId);
  }

  static async updatePlan(planId: string, payload: unknown) {
    return sharedUpdatePlanCoverImage(planId, payload);
  }

  static async createInvite(payload: unknown) {
    return sharedCreateInvite(payload);
  }
}
