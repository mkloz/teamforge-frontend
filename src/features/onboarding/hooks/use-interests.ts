import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import { MAX_INTERESTS, MIN_INTERESTS } from "../data/interests-data";
import type { InterestsScreen } from "../data/interests-types";
import { OnboardingQueries } from "../api/onboarding.queries";
import { buildLeafInterestMap } from "../lib/interest-catalog";
import {
  createInitialCollapsedCategories,
  expandCategoryOnly as buildExpandedCategoryState,
  readMbtiFromSearch,
  toggleCollapsedCategory,
  toggleExpandedSubcategory,
} from "../lib/interests-browser-state";
import { useInterestsStore } from "../store/interests-store";
import {
  getCorrelatedSuggestions,
  getMbtiSuggestions,
  getSearchResults,
  getShouldShowBalanceNudge,
} from "../utils/interest-logic";

interface UseInterestsOptions {
  onComplete: () => void;
}

export type UseInterestsReturn = ReturnType<typeof useInterests>;

export function useInterests({ onComplete }: UseInterestsOptions) {
  const store = useInterestsStore();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { data: currentUser } = AuthQueries.useCurrentUser();

  const {
    data: categories = [],
    error: catalogError,
    isLoading: isCatalogLoading,
    refetch: retryCatalog,
  } = useQuery(OnboardingQueries.interestTree());

  const { mutateAsync: saveInterests, isPending: isSaving } = useMutation({
    mutationFn: OnboardingQueries.setInterests,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: AuthQueries.currentUserQueryKey,
      });
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
    const mbti = readMbtiFromSearch(window.location.search);

    if (mbti && !store.personalityType) {
      store.setPersonalityType(mbti);
      return;
    }

    if (currentUser?.personalityType && !store.personalityType) {
      store.setPersonalityType(currentUser.personalityType);
    }
  }, [currentUser?.personalityType, store]);

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
  };
}
