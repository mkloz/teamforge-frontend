import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { createPaginatedSchema, friendshipApiSchema } from "@/shared/schemas";

const paginatedFriendshipsSchema = createPaginatedSchema(friendshipApiSchema);

type FriendshipPageLimit = number | string;

export async function getFriends(limit: FriendshipPageLimit) {
  const response = await apiClient
    .get("friends", {
      searchParams: {
        limit: String(limit),
      },
    })
    .json<unknown>();

  return parseFriendshipPage(response);
}

export async function getBlockedFriends(limit: FriendshipPageLimit) {
  const response = await apiClient
    .get("friends/blocked", {
      searchParams: {
        limit: String(limit),
      },
    })
    .json<unknown>();

  return parseFriendshipPage(response);
}

export async function getIncomingFriendRequests(limit: FriendshipPageLimit) {
  const response = await apiClient
    .get("friends/requests/incoming", {
      searchParams: {
        limit: String(limit),
      },
    })
    .json<unknown>();

  return parseFriendshipPage(response);
}

export async function getOutgoingFriendRequests(limit: FriendshipPageLimit) {
  const response = await apiClient
    .get("friends/requests/outgoing", {
      searchParams: {
        limit: String(limit),
      },
    })
    .json<unknown>();

  return parseFriendshipPage(response);
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

function parseFriendshipPage(response: unknown) {
  return paginatedFriendshipsSchema.parse(response).items;
}
