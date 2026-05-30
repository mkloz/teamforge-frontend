import type { InfiniteData } from "@tanstack/react-query";
import { EXPLORE_FRIEND_REQUESTS_QUERY_KEY } from "@/features/explore/api/explore-query-keys";
import type { ExploreGroupsQueryData } from "@/features/explore/api/explore-query-options";
import type { ApiResponseWithRequestId } from "@/shared/api/api";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ExploreJoinResult, FriendshipApi } from "@/shared/schemas";

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

function removeGroupFromExplorePages(
  data: InfiniteData<ExploreGroupsQueryData> | undefined,
  groupId: string,
) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => {
      const nextGroups = page.groups.filter((group) => group.id !== groupId);

      if (nextGroups.length === page.groups.length) {
        return page;
      }

      return {
        ...page,
        groups: nextGroups,
        meta: {
          ...page.meta,
          totalItemsCount: Math.max(0, page.meta.totalItemsCount - 1),
        },
      };
    }),
  };
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

  async cancelFriendRequests() {
    await appQueryClient.cancelQueries({
      queryKey: EXPLORE_FRIEND_REQUESTS_QUERY_KEY,
    });
  },

  getFriendRequestsSnapshot() {
    return appQueryClient.getQueryData<FriendshipApi[]>(
      EXPLORE_FRIEND_REQUESTS_QUERY_KEY,
    );
  },

  removeFriendRequest(requesterId: string) {
    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      EXPLORE_FRIEND_REQUESTS_QUERY_KEY,
      (current) =>
        current?.filter((request) => request.requesterId !== requesterId) ??
        current,
    );
  },

  restoreFriendRequests(requests: FriendshipApi[] | undefined) {
    appQueryClient.setQueryData(EXPLORE_FRIEND_REQUESTS_QUERY_KEY, requests);
  },

  removeJoinedGroup(
    result: ExploreJoinResult | ApiResponseWithRequestId<ExploreJoinResult>,
  ) {
    const nextResult = "data" in result ? result.data : result;

    if (nextResult.status !== "JOINED") {
      return;
    }

    for (const [queryKey, data] of appQueryClient.getQueriesData<
      InfiniteData<ExploreGroupsQueryData>
    >({
      queryKey: APP_QUERY_KEYS.explore.groups,
    })) {
      if (!data) {
        continue;
      }

      appQueryClient.setQueryData<InfiniteData<ExploreGroupsQueryData>>(
        queryKey,
        removeGroupFromExplorePages(data, nextResult.groupId),
      );
    }
  },
};
