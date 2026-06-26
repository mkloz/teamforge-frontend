import { useActivityStore } from "@/features/activity/store/activity.store";

export function useActivityListDisplayState() {
  const searchQuery = useActivityStore((state) => state.searchQuery);
  const activeFilter = useActivityStore((state) => state.activeFilter);
  const sidebarDensity = useActivityStore((state) => state.sidebarDensity);

  return {
    activeFilter,
    searchQuery,
    sidebarDensity,
  };
}

export function useActivityListControlActions() {
  const setSearchQuery = useActivityStore((state) => state.setSearchQuery);
  const setActiveFilter = useActivityStore((state) => state.setActiveFilter);
  const setSidebarDensity = useActivityStore(
    (state) => state.setSidebarDensity,
  );

  return {
    setActiveFilter,
    setSearchQuery,
    setSidebarDensity,
  };
}
