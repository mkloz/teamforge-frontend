import {
  getCorrelatedSuggestions,
  getMbtiSuggestions,
  getSearchResults,
  getShouldShowBalanceNudge,
} from "@/features/onboarding/utils/interest-logic";
import type { Interest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";

interface UseInterestSuggestionsInput {
  categories: Interest[];
  deferredSearchQuery: string;
  leafById: Record<string, Interest>;
  personalityType: PersonalityType | null;
  rejectedIds: string[];
  selectedIds: string[];
}

export function useInterestSuggestions({
  categories,
  deferredSearchQuery,
  leafById,
  personalityType,
  rejectedIds,
  selectedIds,
}: UseInterestSuggestionsInput) {
  const selectedSet = new Set(selectedIds);
  const rejectedSet = new Set(rejectedIds);
  const suggestedTags = getMbtiSuggestions(
    personalityType,
    leafById,
    selectedSet,
    rejectedSet,
  );
  const searchResults = getSearchResults(deferredSearchQuery, categories);
  const suggestedIds = new Set(suggestedTags.map((tag) => tag.id));
  const youMightAlsoLike = getCorrelatedSuggestions(
    selectedIds,
    rejectedSet,
    suggestedIds,
    leafById,
    categories,
  );
  const showBalanceNudge = getShouldShowBalanceNudge(selectedIds, categories);

  return {
    rejectedSet,
    searchResults,
    selectedSet,
    showBalanceNudge,
    suggestedTags,
    youMightAlsoLike,
  };
}
