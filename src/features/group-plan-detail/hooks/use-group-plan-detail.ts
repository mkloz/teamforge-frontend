import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { authSession } from "@/shared/api/auth-session";
import { useOnboardingProductStateQuery } from "@/shared/api/onboarding-product-state-query";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";
import type { OnboardingProductState } from "@/shared/schemas/onboarding-product-state";

import { groupPlanDetailQueries } from "../api/group-plan-detail-queries";

export function useGroupPlanDetail(groupId: string) {
  const queryClient = useQueryClient();
  const productStateQuery = useOnboardingProductStateQuery();
  const productState = productStateQuery.data;
  const authorizationScope =
    buildGroupPlanDetailAuthorizationScope(productState);

  const query = useQuery({
    ...groupPlanDetailQueries.detail(
      groupId,
      authSession.getCacheScope(),
      authorizationScope,
    ),
    enabled:
      groupId.length > 0 &&
      productStateQuery.isSuccess &&
      productState !== undefined,
  });

  const errorStatus = getHttpErrorStatus(query.error);
  const accessEnded =
    query.isError &&
    errorStatus !== null &&
    [401, 403, 404].includes(errorStatus);

  useEffect(() => {
    if (!accessEnded) return;

    queryClient.removeQueries({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.detailAllScopes(groupId),
    });
  }, [accessEnded, groupId, queryClient]);

  return {
    data: accessEnded ? undefined : query.data,
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function buildGroupPlanDetailAuthorizationScope(
  productState: OnboardingProductState | undefined,
) {
  if (!productState) return "pending";

  return [
    productState.policyVersion,
    productState.authorizationPolicyVersion,
    productState.stage,
    productState.rollout.introductoryAccess,
    productState.capabilities.VIEW_PUBLIC_GROUP_PLAN.policyVersion,
    productState.capabilities.VIEW_PUBLIC_GROUP_PLAN.allowed
      ? "preview-allowed"
      : "preview-blocked",
    productState.capabilities.REQUEST_PLACE.policyVersion,
    productState.capabilities.REQUEST_PLACE.allowed
      ? "matching-ready"
      : "limited",
  ].join(":");
}
