import type {
  HomeLoadingSlice,
  HomeQueryEntry,
  IncludedHomeData,
} from "@/features/home/hooks/use-home-data/home-types";
import type { HomeQueries } from "@/features/home/hooks/use-home-data/use-home-queries";
import { isApiNetworkError } from "@/shared/api/api-network-error";

export function getActiveHomeQueries(
  include: IncludedHomeData,
  queries: HomeQueries,
): HomeQueryEntry[] {
  return getHomeQueryEntries(include, queries).filter(({ enabled }) => enabled);
}

export function getHomeLoadingState(
  include: IncludedHomeData,
  queries: HomeQueries,
) {
  const loadingState = {
    isStatsLoading: isHomeSliceLoading(include, queries, "stats"),
    isPlansLoading: isHomeSliceLoading(include, queries, "plans"),
    isGroupsLoading: isHomeSliceLoading(include, queries, "groups"),
    isInvitationsLoading: isHomeSliceLoading(include, queries, "invitations"),
    isSentInvitationsLoading: isHomeSliceLoading(
      include,
      queries,
      "sentInvitations",
    ),
    isRecommendationsLoading: isHomeSliceLoading(
      include,
      queries,
      "recommendations",
    ),
  };

  return {
    ...loadingState,
    isLoading: Object.values(loadingState).some(Boolean),
  };
}

export function getHomeAvailabilityState(activeQueries: HomeQueryEntry[]) {
  const hasAllIncludedData = activeQueries.every(
    ({ query }) => query.data !== undefined,
  );
  const isBlockingError = activeQueries.some(
    ({ query }) => query.isError && query.data === undefined,
  );
  const isOfflineUnavailable = activeQueries.some(
    ({ query }) =>
      query.isError &&
      query.data === undefined &&
      isApiNetworkError(query.error),
  );

  return {
    hasAllIncludedData,
    isError: isBlockingError,
    isOfflineUnavailable,
  };
}

function getHomeQueryEntries(
  include: IncludedHomeData,
  queries: HomeQueries,
): HomeQueryEntry[] {
  return [
    { enabled: include.stats, query: queries.stats },
    { enabled: include.plans, query: queries.plans },
    { enabled: include.groups, query: queries.groups },
    { enabled: include.invitations, query: queries.invitations },
    { enabled: include.sentInvitations, query: queries.sentInvitations },
    { enabled: include.recommendations, query: queries.recommendations },
  ];
}

function isHomeSliceLoading(
  include: IncludedHomeData,
  queries: HomeQueries,
  slice: HomeLoadingSlice,
) {
  return include[slice] && queries[slice].isLoading;
}
