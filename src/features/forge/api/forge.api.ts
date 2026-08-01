import { z } from "zod";
import {
  autoForgeRequestCommandSchema,
  autoForgeRequestSchema,
  createAutoForgeRequestInputSchema,
  currentAutoForgeRequestSchema,
  type UpdateAutoForgeRequestInput,
  updateAutoForgeRequestInputSchema,
} from "@/features/forge/schemas/auto-forge-request.schema";
import { friendCompatibilityPreviewSchema } from "@/features/forge/schemas/forge.schemas";
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
  forgeActivityInputSchema,
  forgeActivityResultSchema,
  forgeModeSchema,
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
  forgeMode: forgeModeSchema,
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

export type RecentForgeActivity = z.infer<typeof recentActivitySchema>;

export class ForgeApi {
  static async getCurrentAutoForgeRequest() {
    const response = await apiClient
      .get("auto-forge-requests/current")
      .json<unknown>();

    return currentAutoForgeRequestSchema.parse(response).request;
  }

  static async createAutoForgeRequest(
    activityId: string,
    payload: unknown,
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      `activities/${activityId}/auto-forge-requests`,
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: createAutoForgeRequestInputSchema.parse(payload),
      },
    );

    return parseJsonWithRequestId(response, (value) =>
      autoForgeRequestSchema.parse(value),
    );
  }

  static async updateAutoForgeRequest(
    requestId: string,
    payload: UpdateAutoForgeRequestInput,
    idempotencyKey: string,
  ) {
    const response = await apiClient.patch(`auto-forge-requests/${requestId}`, {
      headers: { "Idempotency-Key": idempotencyKey },
      json: updateAutoForgeRequestInputSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      autoForgeRequestSchema.parse(value),
    );
  }

  static async runAutoForgeRequestCommand(
    requestId: string,
    action: "pause" | "resume" | "cancel" | "retry",
    payload: unknown,
    idempotencyKey: string,
  ) {
    const options = {
      headers: { "Idempotency-Key": idempotencyKey },
      json: autoForgeRequestCommandSchema.parse(payload),
    };
    const response =
      action === "cancel"
        ? await apiClient.delete(`auto-forge-requests/${requestId}`, options)
        : await apiClient.post(
            `auto-forge-requests/${requestId}/${action}`,
            options,
          );

    return parseJsonWithRequestId(response, (value) =>
      autoForgeRequestSchema.parse(value),
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

  static async forgeActivity(activityId: string, payload: unknown) {
    const response = await apiClient.post(`activities/${activityId}/forge`, {
      json: forgeActivityInputSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      forgeActivityResultSchema.parse(value),
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
