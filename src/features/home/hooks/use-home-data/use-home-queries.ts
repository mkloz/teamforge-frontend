import { useQuery } from "@tanstack/react-query";
import { homeQueries } from "@/features/home/api/home-queries";
import type { IncludedHomeData } from "@/features/home/hooks/use-home-data/home-types";
import {
  getOnboardingProjectionScope,
  useOnboardingProductStateQuery,
} from "@/shared/api/onboarding-product-state-query";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

export function useHomeQueries(include: IncludedHomeData) {
  const productStateQuery = useOnboardingProductStateQuery();
  const projectionScope = productStateQuery.data
    ? getOnboardingProjectionScope(productStateQuery.data)
    : "product-state-pending";
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
    ...homeQueries.recommendations(projectionScope),
    enabled: include.recommendations && productStateQuery.isSuccess,
  });
  const recommendationStatus = getHttpErrorStatus(recommendationsQuery.error);
  const recommendationsAccessEnded =
    recommendationStatus === 401 || recommendationStatus === 403;

  return {
    groups: groupsQuery,
    invitations: invitationsQuery,
    plans: plansQuery,
    recommendations: {
      data: recommendationsAccessEnded ? undefined : recommendationsQuery.data,
      error: recommendationsQuery.error,
      isError: recommendationsQuery.isError,
      isLoading: recommendationsQuery.isLoading,
    },
    sentInvitations: sentInvitationsQuery,
    stats: statsQuery,
  };
}

export type HomeQueries = ReturnType<typeof useHomeQueries>;
