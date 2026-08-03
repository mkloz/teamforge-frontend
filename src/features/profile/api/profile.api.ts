import { personalActivityHistoryPageSchema } from "@/features/profile/schemas/personal-activity-history.schema";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  getFriends as sharedGetFriends,
  getIncomingFriendRequests as sharedGetIncomingFriendRequests,
  getOutgoingFriendRequests as sharedGetOutgoingFriendRequests,
} from "@/shared/api/friendship-membership-api";
import { getViewerProfileById } from "@/shared/api/public-user-api";
import type { FriendshipApi } from "@/shared/schemas";
import {
  createPaginatedSchema,
  friendshipApiSchema,
  publicFriendSummaryApiSchema,
} from "@/shared/schemas";

const paginatedFriendshipsSchema = createPaginatedSchema(friendshipApiSchema);
const paginatedPublicFriendsSchema = createPaginatedSchema(
  publicFriendSummaryApiSchema,
);
const FRIENDSHIP_LOOKUP_LIMIT = "100";

function findFriendshipWithUser(friendships: FriendshipApi[], userId: string) {
  return (
    friendships.find((friendship) => friendship.counterpart.id === userId) ??
    null
  );
}

export class ProfileApi {
  static async getMyActivityHistory(cursor?: string) {
    const response = await apiClient
      .get("users/me/activity-history", {
        searchParams: cursor ? { cursor, limit: "20" } : { limit: "20" },
      })
      .json<unknown>();

    return personalActivityHistoryPageSchema.parse(response);
  }

  static async getUserProfile(userId: string) {
    return getViewerProfileById(userId);
  }

  static async getFriendshipWithUser(userId: string) {
    const friendshipPages = await Promise.all([
      sharedGetFriends(FRIENDSHIP_LOOKUP_LIMIT),
      sharedGetIncomingFriendRequests(FRIENDSHIP_LOOKUP_LIMIT),
      sharedGetOutgoingFriendRequests(FRIENDSHIP_LOOKUP_LIMIT),
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

  static async declineFriendRequest(requesterId: string) {
    const response = await apiClient.post(
      `friends/requests/${requesterId}/decline`,
    );

    return parseJsonWithRequestId(response, (value) =>
      friendshipApiSchema.parse(value),
    );
  }

  static async withdrawFriendRequest(targetUserId: string) {
    const response = await apiClient.delete(`friends/requests/${targetUserId}`);

    return parseJsonWithRequestId(response, (value) =>
      friendshipApiSchema.parse(value),
    );
  }

  static async getIncomingFriendRequests() {
    return sharedGetIncomingFriendRequests(20);
  }

  static async getOutgoingFriendRequests() {
    return sharedGetOutgoingFriendRequests(20);
  }

  static async getFriends() {
    return sharedGetFriends(50);
  }

  static async getCommonFriends(userId: string) {
    const response = await apiClient
      .get(`friends/common/${userId}`, {
        searchParams: {
          limit: 50,
        },
      })
      .json<unknown>();

    return paginatedFriendshipsSchema.parse(response).items;
  }

  static async getPublicFriends(userId: string) {
    const response = await apiClient
      .get(`friends/public/${userId}`, {
        searchParams: {
          limit: 50,
        },
      })
      .json<unknown>();

    return paginatedPublicFriendsSchema.parse(response).items;
  }

  static async removeFriend(friendId: string) {
    const response = await apiClient.delete(`friends/${friendId}`);

    return parseJsonWithRequestId(response, (value) =>
      friendshipApiSchema.parse(value),
    );
  }
}
