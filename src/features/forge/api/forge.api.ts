import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  activitySchema,
  activityVisibilitySchema,
  createActivityInputSchema,
  createPaginatedSchema,
  costTypeSchema,
  forgeActivityInputSchema,
  forgeActivityResultSchema,
  forgeModeSchema,
  friendshipApiSchema,
  groupApiSchema,
  inviteSchema,
  locationModeSchema,
  planCategorySchema,
  planSchema,
  type FriendshipApi,
} from "@/shared/schemas";
import { z } from "zod";

const updateGroupPayloadSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  avatar: z.string().trim().max(2048).nullable().optional(),
});

const updatePlanPayloadSchema = z.object({
  coverImage: z.string().trim().max(2048).nullable().optional(),
});

const createInvitePayloadSchema = z.object({
  groupId: z.string().min(1),
  inviteeId: z.string().min(1),
  type: z.enum(["FRIEND_INVITE", "DIRECT_INVITE"]).optional(),
  message: z.string().trim().max(500).optional(),
});

const recentActivityPlanSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  category: planCategorySchema.nullable().optional(),
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
  static async getFriends() {
    const response = await apiClient
      .get("friends", {
        searchParams: {
          limit: 50,
        },
      })
      .json<unknown>();

    return createPaginatedSchema(friendshipApiSchema).parse(response)
      .items as FriendshipApi[];
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

  static async keepSearching(activityId: string, payload: unknown) {
    const response = await apiClient.post(
      `activities/${activityId}/keep-searching`,
      {
        json: forgeActivityInputSchema.parse(payload),
      },
    );

    return parseJsonWithRequestId(response, (value) =>
      activitySchema.parse(value),
    );
  }

  static async stopSearching(activityId: string) {
    const response = await apiClient.post(
      `activities/${activityId}/stop-searching`,
    );

    return parseJsonWithRequestId(response, (value) =>
      activitySchema.parse(value),
    );
  }

  static async forgePendingActivity(activityId: string) {
    const response = await apiClient.post(
      `activities/${activityId}/forge-pending`,
    );

    return parseJsonWithRequestId(response, (value) =>
      forgeActivityResultSchema.parse(value),
    );
  }

  static async getGroup(groupId: string) {
    const response = await apiClient.get(`groups/${groupId}`).json<unknown>();

    return groupApiSchema.parse(response);
  }

  static async updateGroup(groupId: string, payload: unknown) {
    const response = await apiClient.patch(`groups/${groupId}`, {
      json: updateGroupPayloadSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      groupApiSchema.parse(value),
    );
  }

  static async updatePlan(planId: string, payload: unknown) {
    const response = await apiClient.patch(`plans/${planId}`, {
      json: updatePlanPayloadSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) => planSchema.parse(value));
  }

  static async createInvite(payload: unknown) {
    const response = await apiClient.post("invites", {
      json: createInvitePayloadSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      inviteSchema.parse(value),
    );
  }
}
