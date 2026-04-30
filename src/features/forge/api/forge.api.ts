import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  activitySchema,
  createActivityInputSchema,
  createPaginatedSchema,
  forgeActivityInputSchema,
  forgeActivityResultSchema,
  friendshipApiSchema,
  groupApiSchema,
  inviteSchema,
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
