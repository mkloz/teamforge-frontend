import { apiClient } from "@/shared/api/api";
import {
  activitySchema,
  createActivityInputSchema,
  createPaginatedSchema,
  forgeActivityInputSchema,
  forgeActivityResultSchema,
  friendshipApiSchema,
  groupApiSchema,
  type FriendshipApi,
} from "@/shared/schemas";

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
    const response = await apiClient
      .post("activities", {
        json: createActivityInputSchema.parse(payload),
      })
      .json<unknown>();

    return activitySchema.parse(response);
  }

  static async forgeActivity(activityId: string, payload: unknown) {
    const response = await apiClient
      .post(`activities/${activityId}/forge`, {
        json: forgeActivityInputSchema.parse(payload),
      })
      .json<unknown>();

    return forgeActivityResultSchema.parse(response);
  }

  static async getGroup(groupId: string) {
    const response = await apiClient.get(`groups/${groupId}`).json<unknown>();

    return groupApiSchema.parse(response);
  }

  static async updateGroup(
    groupId: string,
    payload: {
      name?: string;
      description?: string | null;
      avatar?: string | null;
    },
  ) {
    const response = await apiClient
      .patch(`groups/${groupId}`, {
        json: payload,
      })
      .json<unknown>();

    return groupApiSchema.parse(response);
  }
}
