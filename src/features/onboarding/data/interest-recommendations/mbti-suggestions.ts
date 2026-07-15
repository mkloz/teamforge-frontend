import { ANALYST_MBTI_SUGGESTIONS } from "@/features/onboarding/data/interest-recommendations/mbti-suggestions/analysts";
import { DIPLOMAT_MBTI_SUGGESTIONS } from "@/features/onboarding/data/interest-recommendations/mbti-suggestions/diplomats";
import { EXPLORER_MBTI_SUGGESTIONS } from "@/features/onboarding/data/interest-recommendations/mbti-suggestions/explorers";
import { SENTINEL_MBTI_SUGGESTIONS } from "@/features/onboarding/data/interest-recommendations/mbti-suggestions/sentinels";
import type { PersonalityType } from "@/shared/schemas/enums";

/**
 * Maps each personality type to a hand-authored list of interest IDs used for
 * initial suggestions.
 */
export const MBTI_SUGGESTIONS: Record<PersonalityType, string[]> = {
  ...ANALYST_MBTI_SUGGESTIONS,
  ...DIPLOMAT_MBTI_SUGGESTIONS,
  ...SENTINEL_MBTI_SUGGESTIONS,
  ...EXPLORER_MBTI_SUGGESTIONS,
};
