import { useQuery } from "@tanstack/react-query";
import { homeQueries } from "@/features/home/api/home-queries";
import type { IncludedHomeData } from "@/features/home/hooks/use-home-data/home-types";

export function useHomeQueries(include: IncludedHomeData) {
  const statsQuery = useQuery({
    ...homeQueries.stats(),
    enabled: include.stats,
  });
  const plansQuery = useQuery({
    ...homeQueries.plans(),
    enabled: include.plans,
  });
  const groupsQuery = useQuery({
    ...homeQueries.groups(),
    enabled: include.groups,
  });
  const invitationsQuery = useQuery({
    ...homeQueries.invitations(),
    enabled: include.invitations,
  });
  const sentInvitationsQuery = useQuery({
    ...homeQueries.sentInvitations(),
    enabled: include.sentInvitations,
  });
  const recommendationsQuery = useQuery({
    ...homeQueries.recommendations(),
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

export type HomeQueries = ReturnType<typeof useHomeQueries>;
