import type { InfiniteData } from "@tanstack/react-query";
import type { ExploreGroupsQueryData } from "@/features/explore/api/explore-queries";
import type { ApiResponseWithRequestId } from "@/shared/api/api";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ExploreJoinResult } from "@/shared/schemas";

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
