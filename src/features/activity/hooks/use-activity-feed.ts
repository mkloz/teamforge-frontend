import { useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { ActivityQueries } from "../api/activity.queries";
import { useActivityStore } from "../store/activity.store";

export function useActivityFeed() {
  const searchQuery = useActivityStore((state) => state.searchQuery);
  const activeFilter = useActivityStore((state) => state.activeFilter);
  const sidebarDensity = useActivityStore((state) => state.sidebarDensity);
  const setSearchQuery = useActivityStore((state) => state.setSearchQuery);
  const setActiveFilter = useActivityStore((state) => state.setActiveFilter);
  const setSidebarDensity = useActivityStore(
    (state) => state.setSidebarDensity,
  );

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const feedQuery = useQuery(
    ActivityQueries.feed(activeFilter, deferredSearchQuery),
  );

  return {
    searchQuery,
    activeFilter,
    sidebarDensity,
    filteredItems: feedQuery.data?.items ?? [],
    groupCount: feedQuery.data?.groupCount ?? 0,
    dmCount: feedQuery.data?.dmCount ?? 0,
    unreadCount: feedQuery.data?.unreadCount ?? 0,
    setSearchQuery,
    setActiveFilter,
    setSidebarDensity,
  };
}
