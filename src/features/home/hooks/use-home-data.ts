import { useQuery } from "@tanstack/react-query";

import { EMPTY_HOME_STATS, HomeQueries } from "../api/home.queries";

const EMPTY_PLANS: never[] = [];
const EMPTY_GROUPS: never[] = [];
const EMPTY_INVITATIONS: never[] = [];
const EMPTY_RECOMMENDATIONS: never[] = [];

export function useHomeData() {
  const statsQuery = useQuery(HomeQueries.stats());
  const plansQuery = useQuery(HomeQueries.plans());
  const groupsQuery = useQuery(HomeQueries.groups());
  const invitationsQuery = useQuery(HomeQueries.invitations());
  const sentInvitationsQuery = useQuery(HomeQueries.sentInvitations());
  const recommendationsQuery = useQuery(HomeQueries.recommendations());

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
    refetchAll: () => {
      statsQuery.refetch();
      plansQuery.refetch();
      groupsQuery.refetch();
      invitationsQuery.refetch();
      sentInvitationsQuery.refetch();
      recommendationsQuery.refetch();
    },
  };
}
