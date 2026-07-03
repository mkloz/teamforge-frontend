import { AnimatePresence, domMax, LazyMotion } from "framer-motion";
import { Activity } from "react";

import { InterestsDiscoveryContent } from "@/features/onboarding/components/interests/interests-browse/interests-browse/interests-discovery-content";
import { SearchResultsOverlay } from "@/features/onboarding/components/interests/interests-browse/interests-browse/search-results-overlay";
import type { InterestsBrowseProps } from "@/features/onboarding/components/interests/interests-browse/interests-browse/types";
import { getInterestsBrowseViewState } from "@/features/onboarding/components/interests/interests-browse/interests-browse/view-state";
import { getToggledAccordionCategoryId } from "@/features/onboarding/components/interests/interests-browse/interests-browse-state";
import { PageTitle } from "@/features/onboarding/components/interests/interests-browse/page-title";
import { SelectionShelf } from "@/features/onboarding/components/interests/interests-browse/selection-shelf";

export function InterestsBrowse({
  categories,
  leafById,
  selectedIds,
  searchQuery,
  searchResults,
  personalityType,
  suggestedTags,
  youMightAlsoLike,
  showBalanceNudge,
  isAtMax,
  collapsedCategories,
  expandedSubcategories,
  onToggle,
  onReject,
  onToggleCategory,
  onToggleSubcategory,
  onRegisterCategory,
  hideContextLabel = false,
}: InterestsBrowseProps) {
  const viewState = getInterestsBrowseViewState({
    categories,
    collapsedCategories,
    personalityType,
    searchQuery,
    selectedIds,
    suggestedTags,
    youMightAlsoLike,
  });

  function handleAccordionChange(newValues: string[]) {
    const toggled = getToggledAccordionCategoryId(
      categories,
      viewState.openCategories,
      newValues,
    );

    if (toggled) {
      onToggleCategory(toggled);
    }
  }

  return (
    <LazyMotion features={domMax}>
      <div className="mx-auto flex w-full max-w-xl flex-col pb-8">
        <PageTitle
          isSearching={viewState.isSearching}
          hideContextLabel={hideContextLabel}
        />

        <div className="relative w-full">
          <Activity mode={viewState.isSearching ? "hidden" : "visible"}>
            <InterestsDiscoveryContent
              categories={categories}
              expandedSubcategories={expandedSubcategories}
              isAtMax={isAtMax}
              personalityType={personalityType}
              selectedIds={selectedIds}
              showBalanceNudge={showBalanceNudge}
              suggestedTags={suggestedTags}
              viewState={viewState}
              youMightAlsoLike={youMightAlsoLike}
              onAccordionChange={handleAccordionChange}
              onRegisterCategory={onRegisterCategory}
              onReject={onReject}
              onToggle={onToggle}
              onToggleSubcategory={onToggleSubcategory}
            />
          </Activity>

          <AnimatePresence>
            {viewState.isSearching ? (
              <SearchResultsOverlay
                key="search-results"
                isAtMax={isAtMax}
                searchQuery={searchQuery}
                searchResults={searchResults}
                selectedIds={selectedIds}
                onToggle={onToggle}
              />
            ) : null}
          </AnimatePresence>
        </div>

        <SelectionShelf
          isSearching={viewState.isSearching}
          leafById={leafById}
          selectedIds={selectedIds}
          youMightAlsoLike={youMightAlsoLike}
          isAtMax={isAtMax}
          onToggle={onToggle}
          onReject={onReject}
        />
      </div>
    </LazyMotion>
  );
}

InterestsBrowse.displayName = "InterestsBrowse";
