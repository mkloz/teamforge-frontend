import { useQuery } from "@tanstack/react-query";

import { EMPTY_HOME_STATS, HomeQueries } from "../api/home.queries";

export function useHomeData() {
  const statsQuery = useQuery(HomeQueries.stats());
  const plansQuery = useQuery(HomeQueries.plans());
  const groupsQuery = useQuery(HomeQueries.groups());
  const invitationsQuery = useQuery(HomeQueries.invitations());
  const recommendationsQuery = useQuery(HomeQueries.recommendations());

  return {
    stats: statsQuery.data ?? EMPTY_HOME_STATS,
    plans: plansQuery.data ?? [],
    groups: groupsQuery.data ?? [],
    invitations: invitationsQuery.data ?? [],
    recommendations: recommendationsQuery.data ?? [],
    isLoading:
      statsQuery.isLoading ||
      plansQuery.isLoading ||
      groupsQuery.isLoading ||
      invitationsQuery.isLoading ||
      recommendationsQuery.isLoading,
    isError:
      statsQuery.isError ||
      plansQuery.isError ||
      groupsQuery.isError ||
      invitationsQuery.isError ||
      recommendationsQuery.isError,
    refetchAll: () => {
      statsQuery.refetch();
      plansQuery.refetch();
      groupsQuery.refetch();
      invitationsQuery.refetch();
      recommendationsQuery.refetch();
    },
  };
}
