import { ANALYST_MBTI_SUGGESTIONS } from "@/features/onboarding/data/interest-recommendations/mbti-suggestions/analysts";
import { DIPLOMAT_MBTI_SUGGESTIONS } from "@/features/onboarding/data/interest-recommendations/mbti-suggestions/diplomats";
import { EXPLORER_MBTI_SUGGESTIONS } from "@/features/onboarding/data/interest-recommendations/mbti-suggestions/explorers";
import { SENTINEL_MBTI_SUGGESTIONS } from "@/features/onboarding/data/interest-recommendations/mbti-suggestions/sentinels";
import type { PersonalityType } from "@/shared/schemas/enums";

/**
 * Maps 4-letter MBTI types to leaf interest ids that statistically correlate
 * with each type's activity profile.
 */
export const MBTI_SUGGESTIONS: Record<PersonalityType, string[]> = {
  ...ANALYST_MBTI_SUGGESTIONS,
  ...DIPLOMAT_MBTI_SUGGESTIONS,
  ...SENTINEL_MBTI_SUGGESTIONS,
  ...EXPLORER_MBTI_SUGGESTIONS,
};
