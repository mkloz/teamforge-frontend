import { useState } from "react";

import { TEMPLATES_PER_PAGE } from "./types";

interface UseTemplatePaginationParams<T> {
  items: T[];
  selectedActivity: string | null;
}

export function useTemplatePagination<T>({
  items,
  selectedActivity,
}: UseTemplatePaginationParams<T>) {
  const [pageState, setPageState] = useState({
    page: 0,
    selectedActivity,
  });
  const pageCount = Math.max(1, Math.ceil(items.length / TEMPLATES_PER_PAGE));
  const page =
    pageState.selectedActivity === selectedActivity
      ? Math.min(pageState.page, pageCount - 1)
      : 0;
  const visibleItems = items.slice(
    page * TEMPLATES_PER_PAGE,
    page * TEMPLATES_PER_PAGE + TEMPLATES_PER_PAGE,
  );

  function showPreviousPage() {
    setPageState({
      selectedActivity,
      page: page === 0 ? pageCount - 1 : page - 1,
    });
  }

  function showNextPage() {
    setPageState({
      selectedActivity,
      page: (page + 1) % pageCount,
    });
  }

  return {
    canPage: pageCount > 1,
    page,
    pageCount,
    showNextPage,
    showPreviousPage,
    visibleItems,
  };
}
