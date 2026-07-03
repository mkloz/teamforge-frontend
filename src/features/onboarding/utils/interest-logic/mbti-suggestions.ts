import { MBTI_SUGGESTIONS } from "@/features/onboarding/data/interest-recommendations";
import type { Interest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";

/**
 * Calculates MBTI-based suggestions based on the user's personality type.
 */
export function getMbtiSuggestions(
  personalityType: PersonalityType | null,
  leafById: Record<string, Interest>,
  selectedIds: Set<string>,
  rejectedIds: Set<string>,
): Interest[] {
  if (!personalityType) return [];
  const suggestions = MBTI_SUGGESTIONS[personalityType] || [];

  return suggestions
    .map((id) => leafById[id])
    .filter((interest): interest is Interest => {
      return (
        Boolean(interest) && interest.isActive && !rejectedIds.has(interest.id)
      );
    })
    .sort((a, b) => {
      const aSelected = selectedIds.has(a.id);
      const bSelected = selectedIds.has(b.id);
      if (aSelected === bSelected) return 0;
      return aSelected ? 1 : -1;
    });
}
