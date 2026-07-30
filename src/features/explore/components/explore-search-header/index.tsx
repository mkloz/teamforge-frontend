import { MobileFiltersSheet } from "./mobile-filters-sheet";
import { SearchInput } from "./search-input";
import { SelectedFiltersBar } from "./selected-filters-bar";
import { SortDropdown } from "./sort-dropdown";

export function ExploreSearchHeader() {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 border-border/45 border-b bg-canvas/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:mb-5 lg:-mx-8 lg:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
        <SearchInput />
        <SortDropdown />
        <MobileFiltersSheet />
      </div>

      <SelectedFiltersBar />
    </div>
  );
}
