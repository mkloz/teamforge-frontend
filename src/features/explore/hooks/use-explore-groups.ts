import { useQuery } from "@tanstack/react-query";
import { ExploreQueries } from "../api/explore.queries";
import { useExploreStore } from "../store/use-explore-store";

export function useExploreGroups() {
  const store = useExploreStore();

  return useQuery(
    ExploreQueries.groups({
      selectedCategories: store.selectedCategories,
      sizeRange: store.sizeRange,
      distance: store.distance,
      locationMode: store.locationMode,
      access: store.access,
      sortBy: store.sortBy,
    }),
  );
}
