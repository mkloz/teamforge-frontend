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
  ExploreFeedItem,
  ExploreGroup,
  ExploreViewInsight,
  PaginationMeta,
} from "@/shared/schemas";

export type ExploreFeedQueryData = {
  items: ExploreFeedItem[];
  insight: ExploreViewInsight;
  meta: PaginationMeta;
};

export type ExploreGroupsQueryData = {
  groups: ExploreGroup[];
  insight: ExploreViewInsight;
  meta: PaginationMeta;
};

const EXPLORE_GROUPS_PAGE_SIZE = "24";

export const exploreQueries = {
  feed(filters: ExploreFilters, searchQuery: string) {
    return infiniteQueryOptions({
      queryKey: APP_QUERY_KEYS.explore.feedWithFilters(searchQuery, filters),
      initialPageParam: 1,
      queryFn: async ({ pageParam }): Promise<ExploreFeedQueryData> => {
        const searchParams = buildExploreSearchParams(
          filters,
          searchQuery,
          pageParam,
        );
        const response = await ExploreApi.getFeed(searchParams);

        return {
          items: response.items,
          insight: response.insight,
          meta: response.meta,
        };
      },
      getNextPageParam: getNextExplorePage,
      placeholderData: keepPreviousData,
      refetchInterval: (query) =>
        query.state.data?.pages.some((page) =>
          page.items.some((item) => item.type === "FORMATION_OPENING"),
        )
          ? 15_000
          : false,
      staleTime: 60_000,
    });
  },

  groups(filters: ExploreFilters, searchQuery: string) {
    return infiniteQueryOptions({
      queryKey: APP_QUERY_KEYS.explore.groupsWithFilters(searchQuery, filters),
      initialPageParam: 1,
      queryFn: async ({ pageParam }): Promise<ExploreGroupsQueryData> => {
        const searchParams = buildExploreSearchParams(
          filters,
          searchQuery,
          pageParam,
        );
        const response = await ExploreApi.getGroups(searchParams);

        return {
          groups: response.items,
          insight: response.insight,
          meta: response.meta,
        };
      },
      getNextPageParam: getNextExplorePage,
      placeholderData: keepPreviousData,
      staleTime: 60_000,
    });
  },
};

function buildExploreSearchParams(
  filters: ExploreFilters,
  searchQuery: string,
  pageParam: number,
) {
  const searchParams = new URLSearchParams();

  setPaginationParams(searchParams, pageParam);
  setMemberRangeParams(searchParams, filters);
  setCategoryParams(searchParams, filters);
  setAccessParam(searchParams, filters);
  setLocationParams(searchParams, filters);
  setTimeRangeParams(searchParams, filters);
  setSearchParam(searchParams, searchQuery);

  return searchParams;
}

function getNextExplorePage(
  lastPage: ExploreFeedQueryData | ExploreGroupsQueryData,
) {
  return lastPage.meta.currentPage < lastPage.meta.totalPages &&
    lastPage.meta.currentPage < API_MAX_PAGE
    ? lastPage.meta.currentPage + 1
    : undefined;
}

function setPaginationParams(searchParams: URLSearchParams, pageParam: number) {
  searchParams.set("page", String(pageParam));
  searchParams.set("limit", EXPLORE_GROUPS_PAGE_SIZE);
}

function setMemberRangeParams(
  searchParams: URLSearchParams,
  filters: ExploreFilters,
) {
  searchParams.set("sortBy", filters.sortBy);
  searchParams.set("minMembers", String(filters.sizeRange[0]));
  searchParams.set("maxMembers", String(filters.sizeRange[1]));
}

function setCategoryParams(
  searchParams: URLSearchParams,
  filters: ExploreFilters,
) {
  const serverCategory = getServerCategory(filters.selectedCategories);

  if (serverCategory) {
    searchParams.set("category", serverCategory);
    return;
  }

  const categories = getSelectedServerCategories(filters);

  if (categories.length > 0) {
    searchParams.set("categories", categories.join(","));
  }
}

function getSelectedServerCategories(filters: ExploreFilters) {
  return Array.from(
    new Set(
      filters.selectedCategories.filter((category) => category !== "ALL"),
    ),
  ).slice(0, EXPLORE_MAX_CATEGORY_FILTERS);
}

function setAccessParam(
  searchParams: URLSearchParams,
  filters: ExploreFilters,
) {
  if (filters.access !== "ALL") {
    searchParams.set("access", filters.access);
  }
}

function setLocationParams(
  searchParams: URLSearchParams,
  filters: ExploreFilters,
) {
  if (filters.locationMode !== "ALL") {
    searchParams.set("locationMode", filters.locationMode);
  }

  if (filters.locationMode !== "ONLINE") {
    searchParams.set("maxDistanceKm", String(filters.distance));
  }
}

function setTimeRangeParams(
  searchParams: URLSearchParams,
  filters: ExploreFilters,
) {
  const timeRange =
    getCustomExploreTimeRange({
      startsAfter: filters.startsAfter,
      startsBefore: filters.startsBefore,
    }) ?? getExploreTimeWindowRange(filters.timeWindow);

  setOptionalDateParam(searchParams, "startsAfter", timeRange?.start);
  setOptionalDateParam(searchParams, "startsBefore", timeRange?.end);
}

function setOptionalDateParam(
  searchParams: URLSearchParams,
  key: string,
  date: Date | null | undefined,
) {
  if (date) {
    searchParams.set(key, date.toISOString());
  }
}

function setSearchParam(searchParams: URLSearchParams, searchQuery: string) {
  const trimmedSearchQuery = searchQuery.trim();

  if (trimmedSearchQuery) {
    searchParams.set("search", trimmedSearchQuery);
  }
}
