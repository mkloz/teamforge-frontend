import { queryOptions } from "@tanstack/react-query";

import { CandidateAvailabilityApi } from "@/features/forge/api/candidate-availability.api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function candidateAvailabilityQueryOptions() {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.forge.candidateAvailability,
    queryFn: () => CandidateAvailabilityApi.get(),
    staleTime: 30_000,
  });
}
