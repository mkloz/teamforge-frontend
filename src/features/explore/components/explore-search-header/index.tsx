import { SearchInput } from "./search-input";
import { SortDropdown } from "./sort-dropdown";
import { MobileFiltersSheet } from "./mobile-filters-sheet";
import { SelectedFiltersBar } from "./selected-filters-bar";

export function ExploreSearchHeader() {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-border/10 bg-canvas/96 px-4 pt-2 pb-2.5 backdrop-blur md:mx-0 md:mb-5 md:px-0 md:pt-0">
      <div className="mt-1 mb-1.5 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:gap-2">
        <SearchInput />
        <SortDropdown />
        <MobileFiltersSheet />
      </div>

      <SelectedFiltersBar />
    </div>
  );
}
