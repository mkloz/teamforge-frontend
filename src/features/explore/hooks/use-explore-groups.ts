import { useQuery } from "@tanstack/react-query";
import { ExploreQueryFactory } from "@/features/explore/api/explore-query-factory";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";

export function useExploreGroups() {
  const state = useExploreRouteState();

  return useQuery(
    ExploreQueryFactory.groups(
      {
        selectedCategories: state.selectedCategories,
        sizeRange: state.sizeRange,
        distance: state.distance,
        locationMode: state.locationMode,
        access: state.access,
        sortBy: state.sortBy,
      },
      state.searchQuery,
    ),
  );
}
