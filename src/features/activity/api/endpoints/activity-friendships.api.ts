import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { friendshipApiSchema } from "@/shared/schemas";

import {
  DEFAULT_ACTIVITY_API_LIMIT,
  paginatedFriendshipsSchema,
} from "@/features/activity/api/activity-api-contracts";

export async function getFriendships() {
  const [friendsResponse, blockedResponse] = await Promise.all([
    apiClient
      .get("friends", {
        searchParams: {
          limit: DEFAULT_ACTIVITY_API_LIMIT,
        },
      })
      .json<unknown>(),
    apiClient
      .get("friends/blocked", {
        searchParams: {
          limit: DEFAULT_ACTIVITY_API_LIMIT,
        },
      })
      .json<unknown>(),
  ]);

  const friends = paginatedFriendshipsSchema.parse(friendsResponse).items;
  const blocked = paginatedFriendshipsSchema.parse(blockedResponse).items;

  return [...friends, ...blocked].sort(
    (left, right) => right.version - left.version,
  );
}

export async function blockUser(userId: string) {
  const response = await apiClient.post(`friends/${userId}/block`);

  return parseJsonWithRequestId(response, (value) =>
    friendshipApiSchema.parse(value),
  );
}

export async function unblockUser(userId: string) {
  const response = await apiClient.delete(`friends/${userId}/block`);

  return parseJsonWithRequestId(response, (value) =>
    friendshipApiSchema.parse(value),
  );
}
