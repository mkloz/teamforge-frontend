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

const SCALAR_FILTER_KEYS = [
  "locationMode",
  "access",
  "timeWindow",
  "startsAfter",
  "startsBefore",
  "distance",
] as const satisfies readonly (keyof ExploreFilters)[];

type ScalarFilterKey = (typeof SCALAR_FILTER_KEYS)[number];

function areCategoryFiltersEqual(
  left: ExploreCategory[],
  right: ExploreCategory[],
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((category, index) => category === right[index]);
}

function normalizeSelectedCategories(
  selectedCategories: ExploreCategory[],
): ExploreCategory[] {
  if (selectedCategories.includes("ALL")) {
    return ["ALL"];
  }

  return Array.from(new Set(selectedCategories)).slice(
    0,
    EXPLORE_MAX_CATEGORY_FILTERS,
  );
}

function getResetExploreFiltersState(): ExploreFilters &
  Pick<ExploreState, "searchQuery"> {
  return {
    ...DEFAULT_FILTERS,
    searchQuery: "",
  };
}

function isSelectedCategoriesFiltered(selectedCategories: ExploreCategory[]) {
  return !areCategoryFiltersEqual(
    selectedCategories,
    DEFAULT_FILTERS.selectedCategories,
  );
}

function isScalarFilterChanged(state: ExploreState, key: ScalarFilterKey) {
  return state[key] !== DEFAULT_FILTERS[key];
}

function isSizeRangeFiltered(sizeRange: ExploreFilters["sizeRange"]) {
  return (
    sizeRange[0] !== DEFAULT_FILTERS.sizeRange[0] ||
    sizeRange[1] !== DEFAULT_FILTERS.sizeRange[1]
  );
}

function isExploreFiltered(state: ExploreState) {
  return (
    isSelectedCategoriesFiltered(state.selectedCategories) ||
    SCALAR_FILTER_KEYS.some((key) => isScalarFilterChanged(state, key)) ||
    isSizeRangeFiltered(state.sizeRange)
  );
}

export const useExploreStore = create<ExploreState>((set, get) => ({
  ...DEFAULT_FILTERS,
  searchQuery: "",

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategories: (selectedCategories) =>
    set({
      selectedCategories: normalizeSelectedCategories(selectedCategories),
    }),
  setSizeRange: (sizeRange) => set({ sizeRange }),
  setDistance: (distance) => set({ distance }),
  setLocationMode: (locationMode) => set({ locationMode }),
  setAccess: (access) => set({ access }),
  setSortBy: (sortBy) => set({ sortBy }),
  setTimeWindow: (timeWindow) => set({ timeWindow }),
  setStartsAfter: (startsAfter) => set({ startsAfter }),
  setStartsBefore: (startsBefore) => set({ startsBefore }),

  resetFilters: () => set(getResetExploreFiltersState()),

  isAnythingFiltered: () => isExploreFiltered(get()),
}));
