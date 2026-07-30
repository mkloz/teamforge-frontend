import {
  apiClient,
  getResponseRequestId,
  parseJsonWithRequestId,
} from "@/shared/api/api";
import {
  createPaginatedSchema,
  friendshipApiSchema,
  userBlockApiSchema,
} from "@/shared/schemas";

const paginatedFriendshipsSchema = createPaginatedSchema(friendshipApiSchema);
const paginatedUserBlocksSchema = createPaginatedSchema(userBlockApiSchema);

type FriendshipPageLimit = number | string;

export async function getFriends(limit: FriendshipPageLimit) {
  return (await getFriendsPage({ limit })).items;
}

export async function getFriendsPage({
  limit,
  page = 1,
  search,
}: {
  limit: FriendshipPageLimit;
  page?: number;
  search?: string;
}) {
  const searchParams: Record<string, string> = {
    limit: String(limit),
    page: String(page),
  };
  const normalizedSearch = search?.trim();

  if (normalizedSearch) {
    searchParams.search = normalizedSearch;
  }

  const response = await apiClient
    .get("friends", {
      searchParams,
    })
    .json<unknown>();

  return paginatedFriendshipsSchema.parse(response);
}

export async function getBlockedUsers(limit: FriendshipPageLimit) {
  const response = await apiClient
    .get("friends/blocked", {
      searchParams: {
        limit: String(limit),
      },
    })
    .json<unknown>();

  return paginatedUserBlocksSchema.parse(response).items;
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
    userBlockApiSchema.parse(value),
  );
}

export async function unblockUser(userId: string) {
  const response = await apiClient.delete(`friends/${userId}/block`);

  return parseUnblockResponse(response);
}

function parseUnblockResponse(response: Response) {
  return {
    requestId: getResponseRequestId(response),
  };
}

function parseFriendshipPage(response: unknown) {
  return paginatedFriendshipsSchema.parse(response).items;
}
