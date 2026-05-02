import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { onboardingInterestTreeQueryOptions } from "@/features/onboarding/api/onboarding-query-options";
import {
  MAX_INTERESTS,
  MIN_INTERESTS,
} from "@/features/onboarding/data/interests-data";
import type { InterestsScreen } from "@/features/onboarding/data/interests-data";
import { buildLeafInterestMap } from "@/features/onboarding/lib/interest-catalog";
import { useInterestsStore } from "@/features/onboarding/store/interests-store";
import type { PersonalityType } from "@/shared/schemas/enums";
import { useInterestBrowserExpansion } from "./use-interest-browser-expansion";
import { useInterestSuggestions } from "./use-interest-suggestions";
import { useSaveInterests } from "./use-save-interests";

interface UseInterestsOptions {
  onComplete: () => void;
  personalityTypeHint?: PersonalityType | null;
}

export type UseInterestsReturn = ReturnType<typeof useInterests>;

export function useInterests({
  onComplete,
  personalityTypeHint = null,
}: UseInterestsOptions) {
  const store = useInterestsStore();
  const { data: currentUser } = useCurrentUserQuery();

  const {
    data: categories = [],
    error: catalogError,
    isLoading: isCatalogLoading,
    refetch: retryCatalog,
  } = useQuery(onboardingInterestTreeQueryOptions());

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    if (personalityTypeHint && !store.personalityType) {
      store.setPersonalityType(personalityTypeHint);
      return;
    }

    if (currentUser?.personalityType && !store.personalityType) {
      store.setPersonalityType(currentUser.personalityType);
    }
  }, [currentUser?.personalityType, personalityTypeHint, store]);

  const leafById = useMemo(
    () => buildLeafInterestMap(categories),
    [categories],
  );
  const browserExpansion = useInterestBrowserExpansion(categories);

  useEffect(() => {
    if (!categories.length) {
      return;
    }

    const validCurrentIds = store.selectedIds.filter((id) => leafById[id]);
    const userInterestIds =
      currentUser?.interests
        ?.map((interest) => interest.id)
        .filter((id) => leafById[id]) ?? [];

    if (!store.selectedIds.length && userInterestIds.length) {
      store.replaceSelected(userInterestIds, MAX_INTERESTS);
      return;
    }

    if (validCurrentIds.length !== store.selectedIds.length) {
      store.replaceSelected(validCurrentIds, MAX_INTERESTS);
    }
  }, [categories, currentUser?.interests, leafById, store]);

  const suggestions = useInterestSuggestions({
    categories,
    deferredSearchQuery,
    leafById,
    personalityType: store.personalityType,
    rejectedIds: store.rejectedIds,
    selectedIds: store.selectedIds,
  });

  const canContinue = store.selectedIds.length >= MIN_INTERESTS;
  const isAtMax = store.selectedIds.length >= MAX_INTERESTS;
  const { finalize, isSaving, saveErrorMessage } = useSaveInterests({
    canContinue,
    onComplete,
    selectedIds: store.selectedIds,
  });

  const goToReview = () => store.setScreen("review");
  const goToBrowse = () => store.setScreen("browse");
  const setScreen = (screen: InterestsScreen) => store.setScreen(screen);
  const toggle = (id: string) => store.toggle(id, MAX_INTERESTS);
  const reject = (id: string) => store.toggleReject(id);

  return {
    screen: store.screen,
    personalityType: store.personalityType,
    categories,
    leafById,
    searchQuery,
    collapsedCategories: browserExpansion.collapsedCategories,
    expandedSubcategories: browserExpansion.expandedSubcategories,
    selectedIds: suggestions.selectedSet,
    selectedCount: store.selectedIds.length,
    canContinue,
    isAtMax,
    suggestedTags: suggestions.suggestedTags,
    searchResults: suggestions.searchResults,
    youMightAlsoLike: suggestions.youMightAlsoLike,
    showBalanceNudge: suggestions.showBalanceNudge,
    isCatalogLoading,
    catalogError,
    isSaving,
    saveErrorMessage,
    setSearchQuery,
    toggleCategory: browserExpansion.toggleCategory,
    expandCategoryOnly: browserExpansion.expandCategoryOnly,
    toggleSubcategory: browserExpansion.toggleSubcategory,
    goToReview,
    goToBrowse,
    setScreen,
    toggle,
    reject,
    finalize,
    retryCatalog,
    isPending: browserExpansion.isPending,
    reset: store.reset,
  };
}
