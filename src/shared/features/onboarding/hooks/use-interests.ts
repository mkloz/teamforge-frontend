import { useDeferredValue, useEffect, useState, useTransition } from "react";
import {
  INTEREST_CATEGORIES,
  MAX_INTERESTS,
  MBTI_SUGGESTIONS,
  MIN_INTERESTS,
} from "../data/interests-data";
import type { InterestsScreen, MbtiType } from "../data/interests-types";
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export type UseInterestsReturn = ReturnType<typeof useInterests>;

export function useInterests({ onComplete }: UseInterestsOptions) {
  const store = useInterestsStore();
  const [isPending, startTransition] = useTransition();

  // ── Session state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    () => new Set(INTEREST_CATEGORIES.map((c) => c.id)),
  );
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Set<string>
  >(new Set());

  // ── MBTI detection ─────────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mbti = params.get("mbti");
    if (mbti && mbti in MBTI_SUGGESTIONS && !store.mbtiType) {
      store.setMbtiType(mbti as MbtiType);
    }
  }, [store]);

  // ── Derived Data ───────────────────────────────────────────────────────────

  const selectedSet = new Set(store.selectedIds);
  const rejectedSet = new Set(store.rejectedIds);

  const suggestedTags = getMbtiSuggestions(
    store.mbtiType,
    selectedSet,
    rejectedSet,
  );

  const searchResults = getSearchResults(deferredSearchQuery);

  const suggestedIds = new Set(suggestedTags.map((t) => t.id));
  const youMightAlsoLike = getCorrelatedSuggestions(
    store.selectedIds,
    rejectedSet,
    suggestedIds,
  );

  const showBalanceNudge = getShouldShowBalanceNudge(store.selectedIds);

  const canContinue = store.selectedIds.length >= MIN_INTERESTS;
  const isAtMax = store.selectedIds.length >= MAX_INTERESTS;

  // ── Actions ────────────────────────────────────────────────────────────────

  function toggleCategory(catId: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }

  function expandCategoryOnly(catId: string) {
    setCollapsedCategories(() => {
      const allIds = INTEREST_CATEGORIES.map((c) => c.id);
      const next = new Set(allIds);
      next.delete(catId);
      return next;
    });
  }

  function toggleSubcategory(subId: string) {
    startTransition(() => {
      setExpandedSubcategories((prev) => {
        const next = new Set(prev);
        if (next.has(subId)) {
          next.delete(subId);
        } else {
          // Find the category this subcategory belongs to and collapse others in it
          const category = INTEREST_CATEGORIES.find((c) =>
            c.subcategories.some((s) => s.id === subId),
          );
          if (category) {
            for (const sub of category.subcategories) {
              next.delete(sub.id);
            }
          }
          next.add(subId);
        }
        return next;
      });
    });
  }

  function finalize() {
    onComplete();
  }

  const goToReview = () => store.setScreen("review");
  const goToBrowse = () => store.setScreen("browse");
  const setScreen = (s: InterestsScreen) => store.setScreen(s);
  const toggle = (id: string) => store.toggle(id, MAX_INTERESTS);
  const reject = (id: string) => store.toggleReject(id);

  return {
    // Persistent Store State
    screen: store.screen,
    mbtiType: store.mbtiType,

    // Session State
    searchQuery,
    collapsedCategories,
    expandedSubcategories,

    // Derived Data
    selectedIds: selectedSet,
    selectedCount: store.selectedIds.length,
    canContinue,
    isAtMax,
    suggestedTags,
    searchResults,
    youMightAlsoLike,
    showBalanceNudge,

    // Actions
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
    isPending,
  };
}
