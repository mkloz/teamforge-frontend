import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  createPaginatedSchema,
  exploreGroupSchema,
  exploreJoinResultSchema,
  exploreViewInsightSchema,
  friendshipApiSchema,
} from "@/shared/schemas";

const paginatedExploreGroupsSchema = createPaginatedSchema(
  exploreGroupSchema,
).extend({
  insight: exploreViewInsightSchema,
});
const paginatedFriendshipsSchema = createPaginatedSchema(friendshipApiSchema);

export class ExploreApi {
  static async getGroups(searchParams: URLSearchParams) {
    const response = await apiClient
      .get("explore/groups", {
        searchParams,
      })
      .json<unknown>();

    return paginatedExploreGroupsSchema.parse(response);
  }

  static async joinGroup(groupId: string) {
    const response = await apiClient.post(`explore/groups/${groupId}/join`);

    return parseJsonWithRequestId(response, (value) =>
      exploreJoinResultSchema.parse(value),
    );
  }

  static async getIncomingFriendRequests() {
    const response = await apiClient
      .get("friends/requests/incoming", {
        searchParams: {
          limit: 20,
        },
      })
      .json<unknown>();

    return paginatedFriendshipsSchema.parse(response).items;
  }

  static async acceptFriendRequest(requesterId: string) {
    const response = await apiClient.post(
      `friends/requests/${requesterId}/accept`,
    );

    return parseJsonWithRequestId(response, (value) =>
      friendshipApiSchema.parse(value),
    );
  }

  static async declineFriendRequest(requesterId: string) {
    const response = await apiClient.post(
      `friends/requests/${requesterId}/decline`,
    );

    return parseJsonWithRequestId(response, (value) =>
      friendshipApiSchema.parse(value),
    );
  }
}
