import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { onboardingInterestTreeQueryOptions } from "@/features/onboarding/api/onboarding-query-options";
import type { InterestsScreen } from "@/features/onboarding/data/interests-data";
import {
  MAX_INTERESTS,
  MIN_INTEREST_CATEGORIES,
  MIN_INTERESTS,
} from "@/features/onboarding/data/interests-data";
import { buildLeafInterestMap } from "@/features/onboarding/lib/interest-catalog";
import {
  getNextInterestPersonalityType,
  getNextSelectedInterestIds,
} from "@/features/onboarding/lib/interest-selection-sync";
import { useInterestsStore } from "@/features/onboarding/store/interests-store";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { useOnboardingProductStateQuery } from "@/shared/api/onboarding-product-state-query";
import type { PersonalityType } from "@/shared/schemas/enums";
import { useInterestBrowserExpansion } from "./use-interest-browser-expansion";
import { useInterestSuggestions } from "./use-interest-suggestions";
import { useSaveInterests } from "./use-save-interests";

interface UseInterestsOptions {
  blockedSaveMessage?: string | null;
  onComplete: () => void;
  personalityTypeHint?: PersonalityType | null;
}

export type UseInterestsReturn = ReturnType<typeof useInterests>;

export function useInterests({
  blockedSaveMessage = null,
  onComplete,
  personalityTypeHint = null,
}: UseInterestsOptions) {
  const store = useInterestsStore();
  const { data: currentUser } = useCurrentUserQuery();
  const { data: productState } = useOnboardingProductStateQuery();

  const {
    data: categories = [],
    error: catalogError,
    isLoading: isCatalogLoading,
    refetch: retryCatalog,
  } = useQuery({
    ...onboardingInterestTreeQueryOptions(),
    enabled: store.screen !== "intro",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const nextPersonalityType = getNextInterestPersonalityType(
      store.personalityType,
      personalityTypeHint,
      currentUser?.personalityType,
    );

    if (nextPersonalityType) {
      store.setPersonalityType(nextPersonalityType);
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

    const nextSelectedIds = getNextSelectedInterestIds({
      selectedIds: store.selectedIds,
      userInterests: currentUser?.interests,
      leafById,
      maxInterests: MAX_INTERESTS,
    });

    if (nextSelectedIds) {
      store.replaceSelected(nextSelectedIds, MAX_INTERESTS);
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

  const selectedCategoryCount = useMemo(() => {
    const selectedIds = new Set(store.selectedIds);

    return categories.filter((category) =>
      (category.children ?? []).some((subcategory) =>
        (subcategory.children ?? []).some((interest) =>
          selectedIds.has(interest.id),
        ),
      ),
    ).length;
  }, [categories, store.selectedIds]);
  const minimumInterestCount =
    productState?.requirements.minimumInterestCount ?? MIN_INTERESTS;
  const minimumInterestCategoryCount =
    productState?.requirements.minimumInterestCategoryCount ??
    MIN_INTEREST_CATEGORIES;
  const canContinue = canContinueInterests(
    store.selectedIds.length,
    selectedCategoryCount,
    minimumInterestCount,
    minimumInterestCategoryCount,
  );
  const isAtMax = store.selectedIds.length >= MAX_INTERESTS;
  const { finalize, isOnline, isSaving, saveErrorMessage } = useSaveInterests({
    blockedSaveMessage,
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
    selectedCategoryCount,
    minimumInterestCount,
    minimumInterestCategoryCount,
    canContinue,
    isAtMax,
    suggestedTags: suggestions.suggestedTags,
    searchResults: suggestions.searchResults,
    youMightAlsoLike: suggestions.youMightAlsoLike,
    showBalanceNudge: suggestions.showBalanceNudge,
    isCatalogLoading,
    catalogError,
    isOnline,
    isSaving,
    saveErrorMessage,
    setSearchQuery,
    toggleCategory: browserExpansion.toggleCategory,
    expandCategoryOnly: browserExpansion.expandCategoryOnly,
    jumpToCategory: browserExpansion.jumpToCategory,
    registerCategoryElement: browserExpansion.registerCategoryElement,
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

export function canContinueInterests(
  selectedCount: number,
  selectedCategoryCount: number,
  minimumInterestCount = MIN_INTERESTS,
  minimumInterestCategoryCount = MIN_INTEREST_CATEGORIES,
) {
  return (
    selectedCount >= minimumInterestCount &&
    selectedCategoryCount >= minimumInterestCategoryCount
  );
}
