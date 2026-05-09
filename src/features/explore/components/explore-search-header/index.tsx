import { MobileFiltersSheet } from "./mobile-filters-sheet";
import { SearchInput } from "./search-input";
import { SelectedFiltersBar } from "./selected-filters-bar";
import { SortDropdown } from "./sort-dropdown";

export function ExploreSearchHeader() {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 border-border/10 border-b bg-canvas/96 px-4 pt-2 pb-2.5 backdrop-blur md:mx-0 md:mb-5 md:px-0 md:pt-0">
      <div className="search-action-grid mt-1 mb-1.5 grid items-center gap-1.5 sm:gap-2">
        <SearchInput />
        <SortDropdown />
        <MobileFiltersSheet />
      </div>

      <SelectedFiltersBar />
    </div>
  );
}
