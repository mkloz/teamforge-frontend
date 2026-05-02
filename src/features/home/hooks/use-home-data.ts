import { useQuery, useQueryClient } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { HomeQueryFactory } from "@/features/home/api/home-query-factory";
import { EMPTY_HOME_STATS } from "@/features/home/lib/home-stats";

const EMPTY_PLANS: never[] = [];
const EMPTY_GROUPS: never[] = [];
const EMPTY_INVITATIONS: never[] = [];
const EMPTY_RECOMMENDATIONS: never[] = [];

export function useHomeData() {
  const queryClient = useQueryClient();
  const statsQuery = useQuery(HomeQueryFactory.stats());
  const plansQuery = useQuery(HomeQueryFactory.plans());
  const groupsQuery = useQuery(HomeQueryFactory.groups());
  const invitationsQuery = useQuery(HomeQueryFactory.invitations());
  const sentInvitationsQuery = useQuery(HomeQueryFactory.sentInvitations());
  const recommendationsQuery = useQuery(HomeQueryFactory.recommendations());

  return {
    stats: statsQuery.data ?? EMPTY_HOME_STATS,
    plans: plansQuery.data ?? EMPTY_PLANS,
    groups: groupsQuery.data ?? EMPTY_GROUPS,
    invitations: invitationsQuery.data ?? EMPTY_INVITATIONS,
    sentInvitations: sentInvitationsQuery.data ?? EMPTY_INVITATIONS,
    recommendations: recommendationsQuery.data ?? EMPTY_RECOMMENDATIONS,
    isLoading:
      statsQuery.isLoading ||
      plansQuery.isLoading ||
      groupsQuery.isLoading ||
      invitationsQuery.isLoading ||
      sentInvitationsQuery.isLoading ||
      recommendationsQuery.isLoading,
    isError:
      statsQuery.isError ||
      plansQuery.isError ||
      groupsQuery.isError ||
      invitationsQuery.isError ||
      sentInvitationsQuery.isError ||
      recommendationsQuery.isError,
    refetchAll: () =>
      queryClient.refetchQueries({
        queryKey: APP_QUERY_KEYS.home.all,
        type: "active",
      }),
  };
}
