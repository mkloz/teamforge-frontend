import { queryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import { OnboardingApi } from "@/features/onboarding/api/onboarding.api";

export function onboardingInterestTreeQueryOptions() {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.onboarding.interestTree,
    queryFn: () => OnboardingApi.getInterestTree(),
    staleTime: 5 * 60_000,
  });
}
