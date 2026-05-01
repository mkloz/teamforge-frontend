import { create } from "zustand";
import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreFilters,
  ExploreLocationMode,
  ExploreSortOption,
} from "@/features/explore/schemas/explore-filters.schema";

interface ExploreState extends ExploreFilters {
  searchQuery: string;
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategories: (categories: ExploreCategory[]) => void;
  setSizeRange: (range: [number, number]) => void;
  setDistance: (distance: number) => void;
  setLocationMode: (mode: ExploreLocationMode) => void;
  setAccess: (access: ExploreAccessMode) => void;
  setSortBy: (sortBy: ExploreSortOption) => void;

  // Helpers
  resetFilters: () => void;
  isAnythingFiltered: () => boolean;
}

function areCategoryFiltersEqual(
  left: ExploreCategory[],
  right: ExploreCategory[],
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((category, index) => category === right[index]);
}

export const useExploreStore = create<ExploreState>((set, get) => ({
  ...DEFAULT_FILTERS,
  searchQuery: "",

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategories: (selectedCategories) => set({ selectedCategories }),
  setSizeRange: (sizeRange) => set({ sizeRange }),
  setDistance: (distance) => set({ distance }),
  setLocationMode: (locationMode) => set({ locationMode }),
  setAccess: (access) => set({ access }),
  setSortBy: (sortBy) => set({ sortBy }),

  resetFilters: () =>
    set({
      searchQuery: "",
      selectedCategories: DEFAULT_FILTERS.selectedCategories,
      sizeRange: DEFAULT_FILTERS.sizeRange,
      distance: DEFAULT_FILTERS.distance,
      locationMode: DEFAULT_FILTERS.locationMode,
      access: DEFAULT_FILTERS.access,
    }),

  isAnythingFiltered: () => {
    const state = get();
    return (
      !areCategoryFiltersEqual(
        state.selectedCategories,
        DEFAULT_FILTERS.selectedCategories,
      ) ||
      state.locationMode !== DEFAULT_FILTERS.locationMode ||
      state.access !== DEFAULT_FILTERS.access ||
      state.distance !== DEFAULT_FILTERS.distance ||
      state.sizeRange[0] !== DEFAULT_FILTERS.sizeRange[0] ||
      state.sizeRange[1] !== DEFAULT_FILTERS.sizeRange[1]
    );
  },
}));
