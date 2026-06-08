import { infiniteQueryOptions, keepPreviousData } from "@tanstack/react-query";
import { ExploreApi } from "@/features/explore/api/explore.api";
import { getServerCategory } from "@/features/explore/api/explore-filters";
import {
  getCustomExploreTimeRange,
  getExploreTimeWindowRange,
} from "@/features/explore/lib/explore-time-window";
import type { ExploreFilters } from "@/features/explore/schemas/explore-filters.schema";
import {
  API_MAX_PAGE,
  EXPLORE_MAX_CATEGORY_FILTERS,
} from "@/shared/api/api-constraints";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type {
  ExploreGroup,
  ExploreViewInsight,
  PaginationMeta,
} from "@/shared/schemas";

export type ExploreGroupsQueryData = {
  groups: ExploreGroup[];
  insight: ExploreViewInsight;
  meta: PaginationMeta;
};

export const ExploreQueryOptions = {
  groups(filters: ExploreFilters, searchQuery: string) {
    return infiniteQueryOptions({
      queryKey: APP_QUERY_KEYS.explore.groupsWithFilters(searchQuery, filters),
      initialPageParam: 1,
      queryFn: async ({ pageParam }): Promise<ExploreGroupsQueryData> => {
        const searchParams = new URLSearchParams();
        const serverCategory = getServerCategory(filters.selectedCategories);
        const timeRange =
          getCustomExploreTimeRange({
            startsAfter: filters.startsAfter,
            startsBefore: filters.startsBefore,
          }) ?? getExploreTimeWindowRange(filters.timeWindow);
        const categories = Array.from(
          new Set(
            filters.selectedCategories.filter((category) => category !== "ALL"),
          ),
        ).slice(0, EXPLORE_MAX_CATEGORY_FILTERS);

        searchParams.set("page", String(pageParam));
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

        if (timeRange) {
          if (timeRange.start) {
            searchParams.set("startsAfter", timeRange.start.toISOString());
          }

          if (timeRange.end) {
            searchParams.set("startsBefore", timeRange.end.toISOString());
          }
        }

        if (searchQuery.trim()) {
          searchParams.set("search", searchQuery.trim());
        }

        const response = await ExploreApi.getGroups(searchParams);

        return {
          groups: response.items,
          insight: response.insight,
          meta: response.meta,
        };
      },
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.totalPages &&
        lastPage.meta.currentPage < API_MAX_PAGE
          ? lastPage.meta.currentPage + 1
          : undefined,
      placeholderData: keepPreviousData,
      staleTime: 60_000,
    });
  },
};
