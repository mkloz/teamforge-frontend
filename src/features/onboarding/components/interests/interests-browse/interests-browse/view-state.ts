import type {
  InterestsBrowseProps,
  InterestsBrowseViewState,
} from "@/features/onboarding/components/interests/interests-browse/interests-browse/types";
import {
  getIsInterestSearchActive,
  getOpenCategoryIds,
} from "@/features/onboarding/components/interests/interests-browse/interests-browse-state";

export function getInterestsBrowseViewState({
  categories,
  collapsedCategories,
  personalityType,
  searchQuery,
  selectedIds,
  suggestedTags,
  youMightAlsoLike,
}: Pick<
  InterestsBrowseProps,
  | "categories"
  | "collapsedCategories"
  | "personalityType"
  | "searchQuery"
  | "selectedIds"
  | "suggestedTags"
  | "youMightAlsoLike"
>): InterestsBrowseViewState {
  return {
    isSearching: getIsInterestSearchActive(searchQuery),
    openCategories: getOpenCategoryIds(categories, collapsedCategories),
    shouldShowSuggestions: personalityType !== null && suggestedTags.length > 0,
    shouldShowYouMightAlsoLike:
      selectedIds.size > 0 && youMightAlsoLike.length > 0,
  };
}
