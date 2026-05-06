import { queryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ExploreGroup, ExploreViewInsight } from "@/shared/schemas";

import { ExploreApi } from "@/features/explore/api/explore.api";
import { EXPLORE_FRIEND_REQUESTS_QUERY_KEY } from "@/features/explore/api/explore-query-keys";
import { getServerCategory } from "@/features/explore/api/explore-filters";
import type { ExploreFilters } from "@/features/explore/schemas/explore-filters.schema";

export type ExploreGroupsQueryData = {
  groups: ExploreGroup[];
  insight: ExploreViewInsight;
};

export const ExploreQueryOptions = {
  groups(filters: ExploreFilters, searchQuery: string) {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.explore.groupsWithFilters(searchQuery, filters),
      queryFn: async (): Promise<ExploreGroupsQueryData> => {
        const searchParams = new URLSearchParams();
        const serverCategory = getServerCategory(filters.selectedCategories);
        const categories = filters.selectedCategories.filter(
          (category) => category !== "ALL",
        );

        searchParams.set("limit", "24");
        searchParams.set("sortBy", filters.sortBy);
        searchParams.set("minMembers", String(filters.sizeRange[0]));
        searchParams.set("maxMembers", String(filters.sizeRange[1]));

        if (serverCategory) {
          searchParams.set("category", serverCategory);
        } else if (categories.length > 0) {
          searchParams.set("categories", categories.join(","));
        }

        if (filters.access !== "ALL") {
          searchParams.set("access", filters.access);
        }

        if (filters.locationMode !== "ALL") {
          searchParams.set("locationMode", filters.locationMode);
        }

        if (filters.locationMode !== "ONLINE") {
          searchParams.set("maxDistanceKm", String(filters.distance));
        }

        if (searchQuery.trim()) {
          searchParams.set("search", searchQuery.trim());
        }

        const response = await ExploreApi.getGroups(searchParams);

        return {
          groups: response.items,
          insight: response.insight,
        };
      },
      placeholderData: (previousData) => previousData,
      staleTime: 60_000,
    });
  },

  friendRequests() {
    return queryOptions({
      queryKey: EXPLORE_FRIEND_REQUESTS_QUERY_KEY,
      queryFn: () => ExploreApi.getIncomingFriendRequests(),
      staleTime: 30_000,
    });
  },
};
