import { SearchInput } from "./search-input";
import { SortDropdown } from "./sort-dropdown";
import { MobileFiltersSheet } from "./mobile-filters-sheet";
import { SelectedFiltersBar } from "./selected-filters-bar";

export function ExploreSearchHeader() {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-5 border-b border-border/10 bg-canvas/96 px-4 pb-3 pt-2 backdrop-blur md:mx-0 md:mb-6 md:px-0 md:pt-0">
      <div className="mb-2 mt-1 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:gap-2">
        <SearchInput />
        <SortDropdown />
        <MobileFiltersSheet />
      </div>

      <SelectedFiltersBar />
    </div>
  );
}
