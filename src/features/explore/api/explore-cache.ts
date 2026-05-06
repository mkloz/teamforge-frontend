import type { ApiResponseWithRequestId } from "@/shared/api/api";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ExploreJoinResult, FriendshipApi } from "@/shared/schemas";

import type { ExploreGroupsQueryData } from "@/features/explore/api/explore-query-options";
import { EXPLORE_FRIEND_REQUESTS_QUERY_KEY } from "@/features/explore/api/explore-query-keys";

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

export const ExploreCache = {
  applyFriendRequestUpdate(friendship: FriendshipApi) {
    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      EXPLORE_FRIEND_REQUESTS_QUERY_KEY,
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

  removeJoinedGroup(
    result: ExploreJoinResult | ApiResponseWithRequestId<ExploreJoinResult>,
  ) {
    const nextResult = "data" in result ? result.data : result;

    if (nextResult.status !== "JOINED") {
      return;
    }

    for (const [
      queryKey,
      data,
    ] of appQueryClient.getQueriesData<ExploreGroupsQueryData>({
      queryKey: APP_QUERY_KEYS.explore.groups,
    })) {
      if (!data) {
        continue;
      }

      appQueryClient.setQueryData<ExploreGroupsQueryData>(queryKey, {
        ...data,
        groups: data.groups.filter((group) => group.id !== nextResult.groupId),
      });
    }
  },
};
