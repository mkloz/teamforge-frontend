import { useExploreGroups } from "@/features/explore/hooks/use-explore-groups";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";

export function useExploreFeed() {
  const groupsQuery = useExploreGroups();
  const { isAnythingFiltered, resetFilters, searchQuery } =
    useExploreRouteState();
  const groups = groupsQuery.data?.pages.flatMap((page) => page.groups) ?? [];
  const firstPage = groupsQuery.data?.pages[0];

  return {
    groups,
    hasGroups: groups.length > 0,
    hasNextPage: groupsQuery.hasNextPage,
    insight: firstPage?.insight,
    isAnythingFiltered,
    isError: groupsQuery.isError,
    isFetchingNextPage: groupsQuery.isFetchingNextPage,
    isLoading: groupsQuery.isLoading,
    fetchNextPage: groupsQuery.fetchNextPage,
    refetch: groupsQuery.refetch,
    resetFilters,
    searchQuery,
    totalGroups: firstPage?.meta.totalItemsCount ?? groups.length,
  };
}
