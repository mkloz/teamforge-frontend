import { useEffect, useRef, useState, useTransition } from "react";
import {
  expandCategoryOnly as buildExpandedCategoryState,
  createInitialCollapsedCategories,
  toggleCollapsedCategory,
  toggleExpandedSubcategory,
} from "@/features/onboarding/lib/interests-browser-state";
import { scrollElementIntoView } from "@/shared/lib/browser-scroll";
import type { Interest } from "@/shared/schemas";

export function useInterestBrowserExpansion(categories: Interest[]) {
  const [isPending, startTransition] = useTransition();
  const categoryElementsRef = useRef(new Map<string, HTMLElement>());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Set<string>
  >(new Set());
  const [pendingCategoryJump, setPendingCategoryJump] = useState<string | null>(
    null,
  );

  const resolvedCollapsedCategories =
    collapsedCategories.size > 0 || !categories.length
      ? collapsedCategories
      : createInitialCollapsedCategories(categories);

  useEffect(() => {
    if (!pendingCategoryJump) {
      return;
    }

    const section = categoryElementsRef.current.get(pendingCategoryJump);
    const trigger = section?.querySelector<HTMLButtonElement>("button");
    trigger?.focus({ preventScroll: true });
    scrollElementIntoView(section ?? null, {
      intent: "locate",
      block: "start",
    });
    setPendingCategoryJump(null);
  }, [pendingCategoryJump]);

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

  function jumpToCategory(categoryId: string) {
    expandCategoryOnly(categoryId);
    setPendingCategoryJump(categoryId);
  }

  function registerCategoryElement(
    categoryId: string,
    element: HTMLElement | null,
  ) {
    if (element) {
      categoryElementsRef.current.set(categoryId, element);
    } else {
      categoryElementsRef.current.delete(categoryId);
    }
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
    jumpToCategory,
    registerCategoryElement,
    toggleCategory,
    toggleSubcategory,
  };
}
