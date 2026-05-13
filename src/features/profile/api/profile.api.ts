import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import type { FriendshipApi } from "@/shared/schemas";
import {
  createPaginatedSchema,
  friendshipApiSchema,
  publicUserResponseSchema,
} from "@/shared/schemas";

const paginatedFriendshipsSchema = createPaginatedSchema(friendshipApiSchema);
const FRIENDSHIP_LOOKUP_LIMIT = "100";

function findFriendshipWithUser(friendships: FriendshipApi[], userId: string) {
  return (
    friendships.find((friendship) => friendship.counterpart.id === userId) ??
    null
  );
}

async function getFriendshipPage(path: string) {
  const response = await apiClient
    .get(path, {
      searchParams: {
        limit: FRIENDSHIP_LOOKUP_LIMIT,
      },
    })
    .json<unknown>();

  return paginatedFriendshipsSchema.parse(response).items;
}

export class ProfileApi {
  static async getUserProfile(userId: string) {
    const response = await apiClient.get(`users/${userId}`).json<unknown>();

    return publicUserResponseSchema.parse(response);
  }

  static async getFriendshipWithUser(userId: string) {
    const friendshipPages = await Promise.all([
      getFriendshipPage("friends"),
      getFriendshipPage("friends/requests/incoming"),
      getFriendshipPage("friends/requests/outgoing"),
      getFriendshipPage("friends/blocked"),
    ]);

    return findFriendshipWithUser(friendshipPages.flat(), userId);
  }

  static async sendFriendRequest(userId: string) {
    const response = await apiClient.post("friends/requests", {
      json: { userId },
    });

    return parseJsonWithRequestId(response, (value) =>
      friendshipApiSchema.parse(value),
    );
  }

  static async acceptFriendRequest(requesterId: string) {
    const response = await apiClient.post(
      `friends/requests/${requesterId}/accept`,
    );

    return parseJsonWithRequestId(response, (value) =>
      friendshipApiSchema.parse(value),
    );
  }
}
