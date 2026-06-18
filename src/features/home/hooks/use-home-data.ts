import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HomeQueryFactory } from "@/features/home/api/home-query-factory";
import { EMPTY_HOME_STATS } from "@/features/home/lib/home-stats";
import { isApiNetworkError } from "@/shared/api/api-network-error";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

const EMPTY_PLANS: never[] = [];
const EMPTY_GROUPS: never[] = [];
const EMPTY_INVITATIONS: never[] = [];
const EMPTY_RECOMMENDATIONS: never[] = [];

type HomeDataSlice =
  | "groups"
  | "invitations"
  | "plans"
  | "recommendations"
  | "sentInvitations"
  | "stats";

interface UseHomeDataOptions {
  include?: Partial<Record<HomeDataSlice, boolean>>;
}

const ALL_HOME_DATA: Record<HomeDataSlice, boolean> = {
  groups: true,
  invitations: true,
  plans: true,
  recommendations: true,
  sentInvitations: true,
  stats: true,
};

const NO_HOME_DATA: Record<HomeDataSlice, boolean> = {
  groups: false,
  invitations: false,
  plans: false,
  recommendations: false,
  sentInvitations: false,
  stats: false,
};

type IncludedHomeData = Record<HomeDataSlice, boolean>;

interface HomeQueryState {
  data: unknown;
  error: unknown;
  isError: boolean;
  isLoading: boolean;
}

interface HomeQueryEntry {
  enabled: boolean;
  query: HomeQueryState;
}

function getIncludedHomeData(options?: UseHomeDataOptions) {
  if (!options?.include) {
    return ALL_HOME_DATA;
  }

  return {
    ...NO_HOME_DATA,
    ...options.include,
  };
}

export function useHomeData(options?: UseHomeDataOptions) {
  const include = getIncludedHomeData(options);
  const queryClient = useQueryClient();
  const queries = useHomeQueries(include);
  const activeQueries = getActiveHomeQueries(include, queries);
  const loadingState = getHomeLoadingState(include, queries);
  const availabilityState = getHomeAvailabilityState(activeQueries);

  return {
    stats: queries.stats.data ?? EMPTY_HOME_STATS,
    plans: queries.plans.data ?? EMPTY_PLANS,
    groups: queries.groups.data ?? EMPTY_GROUPS,
    invitations: queries.invitations.data ?? EMPTY_INVITATIONS,
    sentInvitations: queries.sentInvitations.data ?? EMPTY_INVITATIONS,
    recommendations: queries.recommendations.data ?? EMPTY_RECOMMENDATIONS,
    ...loadingState,
    ...availabilityState,
    refetchAll: () =>
      queryClient.refetchQueries({
        queryKey: APP_QUERY_KEYS.home.all,
        type: "active",
      }),
  };
}

function useHomeQueries(include: IncludedHomeData) {
  const statsQuery = useQuery({
    ...HomeQueryFactory.stats(),
    enabled: include.stats,
  });
  const plansQuery = useQuery({
    ...HomeQueryFactory.plans(),
    enabled: include.plans,
  });
  const groupsQuery = useQuery({
    ...HomeQueryFactory.groups(),
    enabled: include.groups,
  });
  const invitationsQuery = useQuery({
    ...HomeQueryFactory.invitations(),
    enabled: include.invitations,
  });
  const sentInvitationsQuery = useQuery({
    ...HomeQueryFactory.sentInvitations(),
    enabled: include.sentInvitations,
  });
  const recommendationsQuery = useQuery({
    ...HomeQueryFactory.recommendations(),
    enabled: include.recommendations,
  });

  return {
    groups: groupsQuery,
    invitations: invitationsQuery,
    plans: plansQuery,
    recommendations: recommendationsQuery,
    sentInvitations: sentInvitationsQuery,
    stats: statsQuery,
  };
}

type HomeQueries = ReturnType<typeof useHomeQueries>;

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

function getActiveHomeQueries(
  include: IncludedHomeData,
  queries: HomeQueries,
): HomeQueryEntry[] {
  return getHomeQueryEntries(include, queries).filter(({ enabled }) => enabled);
}

function getHomeLoadingState(include: IncludedHomeData, queries: HomeQueries) {
  const isStatsLoading = include.stats && queries.stats.isLoading;
  const isPlansLoading = include.plans && queries.plans.isLoading;
  const isGroupsLoading = include.groups && queries.groups.isLoading;
  const isInvitationsLoading =
    include.invitations && queries.invitations.isLoading;
  const isSentInvitationsLoading =
    include.sentInvitations && queries.sentInvitations.isLoading;
  const isRecommendationsLoading =
    include.recommendations && queries.recommendations.isLoading;

  return {
    isStatsLoading,
    isPlansLoading,
    isGroupsLoading,
    isInvitationsLoading,
    isSentInvitationsLoading,
    isRecommendationsLoading,
    isLoading:
      isStatsLoading ||
      isPlansLoading ||
      isGroupsLoading ||
      isInvitationsLoading ||
      isSentInvitationsLoading ||
      isRecommendationsLoading,
  };
}

function getHomeAvailabilityState(activeQueries: HomeQueryEntry[]) {
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
