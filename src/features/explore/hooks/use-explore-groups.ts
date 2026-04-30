import { useQuery } from "@tanstack/react-query";
import { ExploreQueries } from "../api/explore.queries";
import { useExploreRouteState } from "./use-explore-route-state";

export function useExploreGroups() {
  const state = useExploreRouteState();

  return useQuery(
    ExploreQueries.groups(
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
