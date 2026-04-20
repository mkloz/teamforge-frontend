import { useQuery } from "@tanstack/react-query";
import { useExploreStore } from "../store/use-explore-store";
import { MOCK_GROUPS } from "../data/mock-explore";

export function useExploreGroups() {
  const store = useExploreStore();

  // In a real app, this would be an API call:
  // const { data, isLoading } = useQuery({
  //   queryKey: ['groups', store.selectedCategories, store.sortBy, ...],
  //   queryFn: () => apiClient.get('groups', { searchParams: { ... } }).json<GroupPreview[]>()
  // });

  return useQuery({
    queryKey: [
      "explore-groups",
      store.selectedCategories,
      store.sizeRange,
      store.distance,
      store.locationMode,
      store.access,
      store.sortBy,
    ],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock filtering logic
      return MOCK_GROUPS.filter((group) => {
        // Category filter
        const categoryMatch =
          store.selectedCategories.includes("All") ||
          store.selectedCategories.includes(group.category);

        // Location mode filter
        const locationMatch =
          store.locationMode === "Any" ||
          group.locationMode === store.locationMode;

        // Access filter
        const accessMatch =
          store.access === "All" ||
          group.access === (store.access === "Open" ? "Open" : "By Request");

        // Size filter
        const sizeMatch =
          group.currentSize >= store.sizeRange[0] &&
          group.capacity <= store.sizeRange[1];

        return categoryMatch && locationMatch && accessMatch && sizeMatch;
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}
