import type { CandidateAvailability } from "@/features/forge/schemas/candidate-availability.schema";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function setCandidateAvailability(availability: CandidateAvailability) {
  appQueryClient.setQueryData(
    APP_QUERY_KEYS.forge.candidateAvailability,
    availability,
  );
}

export function invalidateCandidateAvailability() {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.forge.candidateAvailability,
  });
}
