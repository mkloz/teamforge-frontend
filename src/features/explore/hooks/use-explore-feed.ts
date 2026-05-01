import { useExploreGroups } from "@/features/explore/hooks/use-explore-groups";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";

export function useExploreFeed() {
  const groupsQuery = useExploreGroups();
  const { isAnythingFiltered, resetFilters, searchQuery } =
    useExploreRouteState();

  return {
    groups: groupsQuery.data ?? [],
    hasGroups: (groupsQuery.data?.length ?? 0) > 0,
    isAnythingFiltered,
    isError: groupsQuery.isError,
    isLoading: groupsQuery.isLoading,
    refetch: groupsQuery.refetch,
    resetFilters,
    searchQuery,
  };
}
