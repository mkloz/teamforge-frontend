import { useQuery } from "@tanstack/react-query";
import { useExploreStore } from "../store/use-explore-store";
import { MOCK_GROUPS } from "../data/mock-explore";
import type { PlanCategory } from "@/shared/schemas/enums";

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
        const plan = group.plan;
        const activity = group.activity;

        // Category filter
        const groupCategory = plan?.category || "OTHER";
        const categoryMatch =
          store.selectedCategories.includes("ALL") ||
          store.selectedCategories.includes(groupCategory as PlanCategory);

        // Location mode filter
        const locationMatch =
          store.locationMode === "ALL" ||
          plan?.locationMode === store.locationMode;

        // Access filter
        const groupAccess = activity?.access || "OPEN";
        const accessMatch =
          store.access === "ALL" || groupAccess === store.access;

        // Size filter
        const currentSize = group.members?.length || 0;
        const capacity = group.maxMembers || 0;
        const sizeMatch =
          currentSize >= store.sizeRange[0] && capacity <= store.sizeRange[1];

        return categoryMatch && locationMatch && accessMatch && sizeMatch;
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}
