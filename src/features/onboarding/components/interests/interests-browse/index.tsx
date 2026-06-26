import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "react";
import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";
import { Accordion } from "@/shared/components/ui/accordion";
import { cn } from "@/shared/lib/utils";
import type { Interest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";
import { BalanceNudge } from "./balance-nudge";
import { CategorySection } from "./category-section";
import {
  getIsInterestSearchActive,
  getOpenCategoryIds,
  getToggledAccordionCategoryId,
} from "./interests-browse-state";
import { PageTitle } from "./page-title";
import { SearchResults } from "./search-results";
import { SelectionShelf } from "./selection-shelf";
import { SuggestionsSection } from "./suggestions-section";
import { YouMightAlsoLikeSection } from "./you-might-also-like-section";

interface InterestsBrowseProps {
  categories: Interest[];
  leafById: Record<string, Interest>;
  selectedIds: Set<string>;
  searchQuery: string;
  searchResults: InterestSearchResults;
  personalityType: PersonalityType | null;
  suggestedTags: Interest[];
  youMightAlsoLike: Interest[];
  showBalanceNudge: boolean;
  isAtMax: boolean;
  collapsedCategories: Set<string>;
  expandedSubcategories: Set<string>;
  onToggle: (id: string) => void;
  onToggleCategory: (id: string) => void;
  onToggleSubcategory: (id: string) => void;
  onRegisterCategory: (id: string, element: HTMLElement | null) => void;
  onReject: (id: string) => void;
  hideContextLabel?: boolean;
}

interface InterestsBrowseViewState {
  isSearching: boolean;
  openCategories: string[];
  shouldShowSuggestions: boolean;
  shouldShowYouMightAlsoLike: boolean;
}

interface InterestsDiscoveryContentProps {
  categories: Interest[];
  expandedSubcategories: Set<string>;
  isAtMax: boolean;
  personalityType: PersonalityType | null;
  selectedIds: Set<string>;
  showBalanceNudge: boolean;
  suggestedTags: Interest[];
  viewState: InterestsBrowseViewState;
  youMightAlsoLike: Interest[];
  onAccordionChange: (newValues: string[]) => void;
  onRegisterCategory: (id: string, element: HTMLElement | null) => void;
  onReject: (id: string) => void;
  onToggle: (id: string) => void;
  onToggleSubcategory: (id: string) => void;
}

interface SearchResultsOverlayInput {
  isAtMax: boolean;
  isSearching: boolean;
  searchQuery: string;
  searchResults: InterestSearchResults;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

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
          {renderSearchResultsOverlay({
            isAtMax,
            isSearching: viewState.isSearching,
            searchQuery,
            searchResults,
            selectedIds,
            onToggle,
          })}
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
  );
}

InterestsBrowse.displayName = "InterestsBrowse";

function getInterestsBrowseViewState({
  categories,
  collapsedCategories,
  personalityType,
  searchQuery,
  selectedIds,
  suggestedTags,
  youMightAlsoLike,
}: Pick<
  InterestsBrowseProps,
  | "categories"
  | "collapsedCategories"
  | "personalityType"
  | "searchQuery"
  | "selectedIds"
  | "suggestedTags"
  | "youMightAlsoLike"
>): InterestsBrowseViewState {
  return {
    isSearching: getIsInterestSearchActive(searchQuery),
    openCategories: getOpenCategoryIds(categories, collapsedCategories),
    shouldShowSuggestions: personalityType !== null && suggestedTags.length > 0,
    shouldShowYouMightAlsoLike:
      selectedIds.size > 0 && youMightAlsoLike.length > 0,
  };
}

function InterestsDiscoveryContent({
  categories,
  expandedSubcategories,
  isAtMax,
  personalityType,
  selectedIds,
  showBalanceNudge,
  suggestedTags,
  viewState,
  youMightAlsoLike,
  onAccordionChange,
  onRegisterCategory,
  onReject,
  onToggle,
  onToggleSubcategory,
}: InterestsDiscoveryContentProps) {
  return (
    <motion.div
      layout="position"
      animate={{ opacity: viewState.isSearching ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col gap-2",
        viewState.isSearching && "pointer-events-none",
      )}
    >
      <PersonalizedSuggestionsSlot
        isAtMax={isAtMax}
        personalityType={personalityType}
        selectedIds={selectedIds}
        shouldShow={viewState.shouldShowSuggestions}
        suggestedTags={suggestedTags}
        onReject={onReject}
        onToggle={onToggle}
      />

      <BalanceNudgeSlot shouldShow={showBalanceNudge} />

      <Accordion
        type="multiple"
        value={viewState.openCategories}
        onValueChange={onAccordionChange}
      >
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            selectedIds={selectedIds}
            expandedSubcategories={expandedSubcategories}
            isAtMax={isAtMax}
            onRegisterCategory={onRegisterCategory}
            onToggleSubcategory={onToggleSubcategory}
            onToggleTag={onToggle}
          />
        ))}
      </Accordion>

      <YouMightAlsoLikeSlot
        isAtMax={isAtMax}
        selectedIds={selectedIds}
        shouldShow={viewState.shouldShowYouMightAlsoLike}
        tags={youMightAlsoLike}
        onReject={onReject}
        onToggle={onToggle}
      />
    </motion.div>
  );
}

function PersonalizedSuggestionsSlot({
  isAtMax,
  personalityType,
  selectedIds,
  shouldShow,
  suggestedTags,
  onReject,
  onToggle,
}: {
  isAtMax: boolean;
  personalityType: PersonalityType | null;
  selectedIds: Set<string>;
  shouldShow: boolean;
  suggestedTags: Interest[];
  onReject: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  if (!shouldShow || !personalityType) {
    return null;
  }

  return (
    <SuggestionsSection
      personalityType={personalityType}
      suggestedTags={suggestedTags}
      selectedIds={selectedIds}
      isAtMax={isAtMax}
      onToggle={onToggle}
      onReject={onReject}
    />
  );
}

function BalanceNudgeSlot({ shouldShow }: { shouldShow: boolean }) {
  return shouldShow ? <BalanceNudge /> : null;
}

function YouMightAlsoLikeSlot({
  isAtMax,
  selectedIds,
  shouldShow,
  tags,
  onReject,
  onToggle,
}: {
  isAtMax: boolean;
  selectedIds: Set<string>;
  shouldShow: boolean;
  tags: Interest[];
  onReject: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="pt-4">
      <YouMightAlsoLikeSection
        tags={tags}
        selectedIds={selectedIds}
        isAtMax={isAtMax}
        onToggle={onToggle}
        onReject={onReject}
      />
    </div>
  );
}

function renderSearchResultsOverlay({
  isAtMax,
  isSearching,
  searchQuery,
  searchResults,
  selectedIds,
  onToggle,
}: SearchResultsOverlayInput) {
  if (!isSearching) {
    return null;
  }

  return (
    <motion.div
      key="search-results"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="relative z-20 w-full"
    >
      <SearchResults
        query={searchQuery}
        results={searchResults}
        selectedIds={selectedIds}
        isAtMax={isAtMax}
        onToggle={onToggle}
      />
    </motion.div>
  );
}
