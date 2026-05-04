import { queryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ExploreGroup } from "@/shared/schemas";

import { ExploreApi } from "@/features/explore/api/explore.api";
import { EXPLORE_FRIEND_REQUESTS_QUERY_KEY } from "@/features/explore/api/explore-query-keys";
import {
  filterExploreGroups,
  getServerCategory,
  sortExploreGroups,
} from "@/features/explore/api/explore-filters";
import type { ExploreFilters } from "@/features/explore/schemas/explore-filters.schema";

export const ExploreQueryOptions = {
  groups(filters: ExploreFilters, searchQuery: string) {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.explore.groupsWithFilters(searchQuery, filters),
      queryFn: async (): Promise<ExploreGroup[]> => {
        const searchParams = new URLSearchParams();
        const serverCategory = getServerCategory(filters.selectedCategories);

        searchParams.set("limit", "24");

        if (serverCategory) {
          searchParams.set("category", serverCategory);
        }

        if (filters.access !== "ALL") {
          searchParams.set("access", filters.access);
        }

        if (searchQuery.trim()) {
          searchParams.set("search", searchQuery.trim());
        }

        const groups = await ExploreApi.getGroups(searchParams);
        const filteredGroups = filterExploreGroups(
          groups,
          filters,
          searchQuery,
        );

        return sortExploreGroups(filteredGroups, filters.sortBy);
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
