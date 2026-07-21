import { queryOptions } from "@tanstack/react-query";

import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-query";
import { PersonalityAssessmentApi } from "@/shared/api/personality-assessment-api";

export const PERSONALITY_ASSESSMENT_QUERY_KEY = [
  ...CURRENT_USER_QUERY_KEY,
  "personality-assessment",
] as const;

export const PERSONALITY_ASSESSMENT_CAPABILITIES_QUERY_KEY = [
  ...PERSONALITY_ASSESSMENT_QUERY_KEY,
  "capabilities",
] as const;

export function personalityAssessmentQueryOptions() {
  return queryOptions({
    queryKey: PERSONALITY_ASSESSMENT_QUERY_KEY,
    queryFn: () => PersonalityAssessmentApi.getState(),
    staleTime: 30_000,
  });
}

export function personalityAssessmentCapabilitiesQueryOptions() {
  return queryOptions({
    queryKey: PERSONALITY_ASSESSMENT_CAPABILITIES_QUERY_KEY,
    queryFn: () => PersonalityAssessmentApi.getCapabilities(),
    staleTime: 5 * 60_000,
  });
}
