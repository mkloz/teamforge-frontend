import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { FriendshipApi } from "@/shared/schemas";

function getFriendshipVersion(friendship: FriendshipApi) {
  return friendship.version ?? new Date(friendship.updatedAt).getTime();
}

function isSameFriendshipPair(
  left: Pick<FriendshipApi, "requesterId" | "receiverId">,
  right: Pick<FriendshipApi, "requesterId" | "receiverId">,
) {
  return (
    (left.requesterId === right.requesterId &&
      left.receiverId === right.receiverId) ||
    (left.requesterId === right.receiverId &&
      left.receiverId === right.requesterId)
  );
}

function mergeFriendships(
  current: FriendshipApi[] | undefined,
  incoming: FriendshipApi,
) {
  const existing = current?.find((item) =>
    isSameFriendshipPair(item, incoming),
  );
  const nextFriendship =
    existing && getFriendshipVersion(existing) > getFriendshipVersion(incoming)
      ? existing
      : incoming;
  const withoutExisting =
    current?.filter((item) => !isSameFriendshipPair(item, incoming)) ?? [];

  return [nextFriendship, ...withoutExisting].sort(
    (left, right) => getFriendshipVersion(right) - getFriendshipVersion(left),
  );
}

export const ProfileFriendsCache = {
  applyFriendRequestUpdate(friendship: FriendshipApi) {
    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      APP_QUERY_KEYS.profile.friendRequests,
      (current) => {
        const merged = mergeFriendships(current, friendship);
        return merged.filter((item) => item.status === "PENDING");
      },
    );

    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      APP_QUERY_KEYS.activity.friendships,
      (current) => mergeFriendships(current, friendship),
    );
  },

  async cancelFriendRequests() {
    await appQueryClient.cancelQueries({
      queryKey: APP_QUERY_KEYS.profile.friendRequests,
    });
  },

  getFriendRequestsSnapshot() {
    return appQueryClient.getQueryData<FriendshipApi[]>(
      APP_QUERY_KEYS.profile.friendRequests,
    );
  },

  removeFriendRequest(requesterId: string) {
    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      APP_QUERY_KEYS.profile.friendRequests,
      (current) =>
        current?.filter((request) => request.requesterId !== requesterId) ??
        current,
    );
  },

  restoreFriendRequests(requests: FriendshipApi[] | undefined) {
    appQueryClient.setQueryData(
      APP_QUERY_KEYS.profile.friendRequests,
      requests,
    );
  },
};
