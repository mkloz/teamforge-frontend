import { create } from "zustand";
import type { PlanCategory } from "@/shared/schemas/enums";
import { DEFAULT_FILTERS } from "../constants/explore.constants";
import type {
  ExploreFilters,
  ExploreAccessMode,
  ExploreLocationMode,
  ExploreSortOption,
} from "../schemas/explore-filters.schema";

interface ExploreState extends ExploreFilters {
  searchQuery: string;
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategories: (categories: (PlanCategory | "ALL")[]) => void;
  setSizeRange: (range: [number, number]) => void;
  setDistance: (distance: number) => void;
  setLocationMode: (mode: ExploreLocationMode) => void;
  setAccess: (access: ExploreAccessMode) => void;
  setSortBy: (sortBy: ExploreSortOption) => void;

  // Helpers
  resetFilters: () => void;
  isAnythingFiltered: () => boolean;
  removeCategory: (category: PlanCategory | "ALL") => void;
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
      state.selectedCategories[0] !== DEFAULT_FILTERS.selectedCategories[0] ||
      state.locationMode !== DEFAULT_FILTERS.locationMode ||
      state.access !== DEFAULT_FILTERS.access ||
      state.distance !== DEFAULT_FILTERS.distance ||
      state.sizeRange[0] !== DEFAULT_FILTERS.sizeRange[0] ||
      state.sizeRange[1] !== DEFAULT_FILTERS.sizeRange[1]
    );
  },

  removeCategory: (category) => {
    const { selectedCategories } = get();
    const next = selectedCategories.filter((c) => c !== category);
    set({ selectedCategories: next.length === 0 ? ["ALL"] : next });
  },
}));
