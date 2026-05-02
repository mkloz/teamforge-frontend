import { useState, useTransition } from "react";

import type { Interest } from "@/shared/schemas";
import {
  createInitialCollapsedCategories,
  expandCategoryOnly as buildExpandedCategoryState,
  toggleCollapsedCategory,
  toggleExpandedSubcategory,
} from "@/features/onboarding/lib/interests-browser-state";

export function useInterestBrowserExpansion(categories: Interest[]) {
  const [isPending, startTransition] = useTransition();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Set<string>
  >(new Set());

  const resolvedCollapsedCategories =
    collapsedCategories.size > 0 || !categories.length
      ? collapsedCategories
      : createInitialCollapsedCategories(categories);

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

  return {
    collapsedCategories: resolvedCollapsedCategories,
    expandedSubcategories,
    expandCategoryOnly,
    isPending,
    toggleCategory,
    toggleSubcategory,
  };
}
