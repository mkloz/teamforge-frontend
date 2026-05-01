import { SearchInput } from "@/features/explore/components/explore-search-header/search-input";
import { SortDropdown } from "@/features/explore/components/explore-search-header/sort-dropdown";
import { MobileFiltersSheet } from "@/features/explore/components/explore-search-header/mobile-filters-sheet";
import { SelectedFiltersBar } from "@/features/explore/components/explore-search-header/selected-filters-bar";

export function ExploreSearchHeader() {
  return (
    <div className="sticky top-0 z-30 bg-canvas pt-1 pb-1 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:pt-0 border-b border-border/5">
      <div className="flex items-center gap-1.5 mb-1 mt-1">
        <SearchInput />
        <SortDropdown />
        <MobileFiltersSheet />
      </div>

      <SelectedFiltersBar />
    </div>
  );
}
