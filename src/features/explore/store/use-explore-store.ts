import { create } from "zustand";
import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreFilters,
  ExploreLocationMode,
  ExploreSortOption,
  ExploreTimeWindow,
} from "@/features/explore/schemas/explore-filters.schema";
import { EXPLORE_MAX_CATEGORY_FILTERS } from "@/shared/api/api-constraints";

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
  setTimeWindow: (timeWindow: ExploreTimeWindow) => void;
  setStartsAfter: (startsAfter: string | null) => void;
  setStartsBefore: (startsBefore: string | null) => void;

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
  setSelectedCategories: (selectedCategories) =>
    set({
      selectedCategories: selectedCategories.includes("ALL")
        ? ["ALL"]
        : Array.from(new Set(selectedCategories)).slice(
            0,
            EXPLORE_MAX_CATEGORY_FILTERS,
          ),
    }),
  setSizeRange: (sizeRange) => set({ sizeRange }),
  setDistance: (distance) => set({ distance }),
  setLocationMode: (locationMode) => set({ locationMode }),
  setAccess: (access) => set({ access }),
  setSortBy: (sortBy) => set({ sortBy }),
  setTimeWindow: (timeWindow) => set({ timeWindow }),
  setStartsAfter: (startsAfter) => set({ startsAfter }),
  setStartsBefore: (startsBefore) => set({ startsBefore }),

  resetFilters: () =>
    set({
      searchQuery: "",
      selectedCategories: DEFAULT_FILTERS.selectedCategories,
      sizeRange: DEFAULT_FILTERS.sizeRange,
      distance: DEFAULT_FILTERS.distance,
      locationMode: DEFAULT_FILTERS.locationMode,
      access: DEFAULT_FILTERS.access,
      sortBy: DEFAULT_FILTERS.sortBy,
      timeWindow: DEFAULT_FILTERS.timeWindow,
      startsAfter: DEFAULT_FILTERS.startsAfter,
      startsBefore: DEFAULT_FILTERS.startsBefore,
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
      state.timeWindow !== DEFAULT_FILTERS.timeWindow ||
      state.startsAfter !== DEFAULT_FILTERS.startsAfter ||
      state.startsBefore !== DEFAULT_FILTERS.startsBefore ||
      state.distance !== DEFAULT_FILTERS.distance ||
      state.sizeRange[0] !== DEFAULT_FILTERS.sizeRange[0] ||
      state.sizeRange[1] !== DEFAULT_FILTERS.sizeRange[1]
    );
  },
}));
