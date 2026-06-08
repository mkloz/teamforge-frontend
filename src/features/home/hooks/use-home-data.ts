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
  const activeQueries = [
    { enabled: include.stats, query: statsQuery },
    { enabled: include.plans, query: plansQuery },
    { enabled: include.groups, query: groupsQuery },
    { enabled: include.invitations, query: invitationsQuery },
    { enabled: include.sentInvitations, query: sentInvitationsQuery },
    { enabled: include.recommendations, query: recommendationsQuery },
  ].filter(({ enabled }) => enabled);
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
    stats: statsQuery.data ?? EMPTY_HOME_STATS,
    plans: plansQuery.data ?? EMPTY_PLANS,
    groups: groupsQuery.data ?? EMPTY_GROUPS,
    invitations: invitationsQuery.data ?? EMPTY_INVITATIONS,
    sentInvitations: sentInvitationsQuery.data ?? EMPTY_INVITATIONS,
    recommendations: recommendationsQuery.data ?? EMPTY_RECOMMENDATIONS,
    isStatsLoading: include.stats && statsQuery.isLoading,
    isPlansLoading: include.plans && plansQuery.isLoading,
    isGroupsLoading: include.groups && groupsQuery.isLoading,
    isInvitationsLoading: include.invitations && invitationsQuery.isLoading,
    isSentInvitationsLoading:
      include.sentInvitations && sentInvitationsQuery.isLoading,
    isRecommendationsLoading:
      include.recommendations && recommendationsQuery.isLoading,
    isLoading:
      (include.stats && statsQuery.isLoading) ||
      (include.plans && plansQuery.isLoading) ||
      (include.groups && groupsQuery.isLoading) ||
      (include.invitations && invitationsQuery.isLoading) ||
      (include.sentInvitations && sentInvitationsQuery.isLoading) ||
      (include.recommendations && recommendationsQuery.isLoading),
    hasAllIncludedData,
    isError: isBlockingError,
    isOfflineUnavailable,
    refetchAll: () =>
      queryClient.refetchQueries({
        queryKey: APP_QUERY_KEYS.home.all,
        type: "active",
      }),
  };
}
