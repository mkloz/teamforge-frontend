import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api/api";
import { authSession } from "@/shared/api/auth-session";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import {
  type OnboardingProductState,
  onboardingProductStateSchema,
} from "@/shared/schemas/onboarding-product-state";

const PROJECTION_CAPABILITIES = [
  "BROWSE_PUBLIC_CONTENT",
  "VIEW_PUBLIC_GROUP_PLAN",
  "REQUEST_PLACE",
] as const;

export function getOnboardingProjectionScope(state: OnboardingProductState) {
  const capabilityScope = PROJECTION_CAPABILITIES.map((capability) => {
    const decision = state.capabilities[capability];
    return `${capability}:${decision.allowed ? "1" : "0"}:${decision.policyVersion}`;
  }).join("|");

  return [
    state.authorizationPolicyVersion,
    state.policyVersion,
    state.stage,
    state.rollout.introductoryAccess,
    capabilityScope,
  ].join("|");
}

interface ProjectionCacheClearOptions {
  preserveExploreQueries?: boolean;
  preserveHomeRecommendations?: boolean;
}

export function clearProjectionSensitiveCaches(
  options: ProjectionCacheClearOptions = {},
) {
  if (!options.preserveExploreQueries) {
    appQueryClient.removeQueries({ queryKey: APP_QUERY_KEYS.explore.feed });
    appQueryClient.removeQueries({ queryKey: APP_QUERY_KEYS.explore.groups });
  }
  if (!options.preserveHomeRecommendations) {
    appQueryClient.removeQueries({
      queryKey: APP_QUERY_KEYS.home.recommendations,
    });
  }
  appQueryClient.removeQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.all,
  });
}

export function onboardingProductStateQueryOptions() {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.onboarding.productStateForSession(
      authSession.getCacheScope(),
    ),
    queryFn: async () => {
      const previous = getCachedOnboardingProductState();
      const response = await apiClient
        .get("onboarding/product-state")
        .json<unknown>();
      const next = onboardingProductStateSchema.parse(response);

      if (
        previous &&
        getOnboardingProjectionScope(previous) !==
          getOnboardingProjectionScope(next)
      ) {
        clearProjectionSensitiveCaches();
      }

      return next;
    },
    staleTime: 30_000,
  });
}

export function ensureOnboardingProductState() {
  return appQueryClient.fetchQuery(onboardingProductStateQueryOptions());
}

export function getCachedOnboardingProductState() {
  return appQueryClient.getQueryData(
    onboardingProductStateQueryOptions().queryKey,
  );
}

export function useOnboardingProductStateQuery() {
  const { isAuthenticated } = useAuthSessionState();

  return useQuery({
    ...onboardingProductStateQueryOptions(),
    enabled: isAuthenticated,
  });
}

export function useInvalidateOnboardingProductState() {
  return () => {
    clearProjectionSensitiveCaches();

    return appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.onboarding.productState,
    });
  };
}
