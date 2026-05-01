import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { OnboardingCache } from "@/features/onboarding/api/onboarding-cache";
import { OnboardingCommands } from "@/features/onboarding/api/onboarding-commands";
import { onboardingInterestTreeQueryOptions } from "@/features/onboarding/api/onboarding-query-options";
import {
  MAX_INTERESTS,
  MIN_INTERESTS,
} from "@/features/onboarding/data/interests-data";
import type { InterestsScreen } from "@/features/onboarding/data/interests-data";
import { buildLeafInterestMap } from "@/features/onboarding/lib/interest-catalog";
import {
  createInitialCollapsedCategories,
  expandCategoryOnly as buildExpandedCategoryState,
  toggleCollapsedCategory,
  toggleExpandedSubcategory,
} from "@/features/onboarding/lib/interests-browser-state";
import { useInterestsStore } from "@/features/onboarding/store/interests-store";
import {
  getCorrelatedSuggestions,
  getMbtiSuggestions,
  getSearchResults,
  getShouldShowBalanceNudge,
} from "@/features/onboarding/utils/interest-logic";
import type { PersonalityType } from "@/shared/schemas/enums";

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
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { data: currentUser } = useCurrentUserQuery();

  const {
    data: categories = [],
    error: catalogError,
    isLoading: isCatalogLoading,
    refetch: retryCatalog,
  } = useQuery(onboardingInterestTreeQueryOptions());

  const { mutateAsync: saveInterests, isPending: isSaving } = useMutation({
    mutationFn: OnboardingCommands.setInterests,
    onSuccess: async (result) => {
      OnboardingCache.applySavedInterests(queryClient, result.interests);
      await OnboardingCache.invalidateCurrentUser(queryClient);
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Set<string>
  >(new Set());

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
  const resolvedCollapsedCategories = useMemo(() => {
    if (collapsedCategories.size > 0 || !categories.length) {
      return collapsedCategories;
    }

    return createInitialCollapsedCategories(categories);
  }, [categories, collapsedCategories]);

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

  const selectedSet = useMemo(
    () => new Set(store.selectedIds),
    [store.selectedIds],
  );
  const rejectedSet = useMemo(
    () => new Set(store.rejectedIds),
    [store.rejectedIds],
  );

  const suggestedTags = useMemo(
    () =>
      getMbtiSuggestions(
        store.personalityType,
        leafById,
        selectedSet,
        rejectedSet,
      ),
    [leafById, rejectedSet, selectedSet, store.personalityType],
  );

  const searchResults = useMemo(
    () => getSearchResults(deferredSearchQuery, categories),
    [categories, deferredSearchQuery],
  );

  const suggestedIds = useMemo(
    () => new Set(suggestedTags.map((tag) => tag.id)),
    [suggestedTags],
  );

  const youMightAlsoLike = useMemo(
    () =>
      getCorrelatedSuggestions(
        store.selectedIds,
        rejectedSet,
        suggestedIds,
        leafById,
        categories,
      ),
    [categories, leafById, rejectedSet, store.selectedIds, suggestedIds],
  );

  const showBalanceNudge = useMemo(
    () => getShouldShowBalanceNudge(store.selectedIds, categories),
    [categories, store.selectedIds],
  );

  const canContinue = store.selectedIds.length >= MIN_INTERESTS;
  const isAtMax = store.selectedIds.length >= MAX_INTERESTS;

  function toggleCategory(categoryId: string) {
    setCollapsedCategories((prev) =>
      toggleCollapsedCategory(
        prev.size > 0 || !categories.length
          ? prev
          : createInitialCollapsedCategories(categories),
        categoryId,
      ),
    );
  }

  function expandCategoryOnly(categoryId: string) {
    setCollapsedCategories(() =>
      buildExpandedCategoryState(categories, categoryId),
    );
  }

  function toggleSubcategory(subcategoryId: string) {
    startTransition(() => {
      setExpandedSubcategories((prev) =>
        toggleExpandedSubcategory(categories, prev, subcategoryId),
      );
    });
  }

  async function finalize() {
    if (!canContinue || isSaving) {
      return;
    }

    setSaveErrorMessage(null);

    try {
      await saveInterests({
        interestIds: store.selectedIds,
      });

      onComplete();
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSaveErrorMessage(error.message);
        return;
      }

      setSaveErrorMessage(
        "We couldn’t save your interests just yet. Please try again.",
      );
    }
  }

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
    collapsedCategories: resolvedCollapsedCategories,
    expandedSubcategories,
    selectedIds: selectedSet,
    selectedCount: store.selectedIds.length,
    canContinue,
    isAtMax,
    suggestedTags,
    searchResults,
    youMightAlsoLike,
    showBalanceNudge,
    isCatalogLoading,
    catalogError,
    isSaving,
    saveErrorMessage,
    setSearchQuery,
    toggleCategory,
    expandCategoryOnly,
    toggleSubcategory,
    goToReview,
    goToBrowse,
    setScreen,
    toggle,
    reject,
    finalize,
    retryCatalog,
    isPending,
    reset: store.reset,
  };
}
