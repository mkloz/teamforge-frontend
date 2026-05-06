import type { Interest } from "@/shared/schemas";
import { Accordion } from "@/shared/components/ui/accordion";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "react";
import type { PersonalityType } from "@/shared/schemas/enums";
import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";
import { BalanceNudge } from "./balance-nudge";
import { CategorySection } from "./category-section";
import { PageTitle } from "./page-title";
import { SearchResults } from "./search-results";
import { SelectionShelf } from "./selection-shelf";
import { SuggestionsSection } from "./suggestions-section";
import {
  getIsInterestSearchActive,
  getOpenCategoryIds,
  getToggledAccordionCategoryId,
} from "./interests-browse-state";
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
  const isSearching = getIsInterestSearchActive(searchQuery);
  const openCategories = getOpenCategoryIds(categories, collapsedCategories);

  function handleAccordionChange(newValues: string[]) {
    const toggled = getToggledAccordionCategoryId(
      categories,
      openCategories,
      newValues,
    );

    if (toggled) {
      onToggleCategory(toggled);
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col w-full max-w-xl mx-auto pb-8">
        <PageTitle
          isSearching={isSearching}
          hideContextLabel={hideContextLabel}
        />

        <div className="relative w-full">
          <Activity mode={isSearching ? "hidden" : "visible"}>
            <motion.div
              layout="position"
              animate={{ opacity: isSearching ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex flex-col gap-2",
                isSearching && "pointer-events-none",
              )}
            >
              {personalityType && suggestedTags.length > 0 && (
                <SuggestionsSection
                  personalityType={personalityType}
                  suggestedTags={suggestedTags}
                  selectedIds={selectedIds}
                  isAtMax={isAtMax}
                  onToggle={onToggle}
                  onReject={onReject}
                />
              )}

              {showBalanceNudge && <BalanceNudge />}

              <Accordion
                type="multiple"
                value={openCategories}
                onValueChange={handleAccordionChange}
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

              {selectedIds.size > 0 && youMightAlsoLike.length > 0 && (
                <div className="pt-4">
                  <YouMightAlsoLikeSection
                    tags={youMightAlsoLike}
                    selectedIds={selectedIds}
                    isAtMax={isAtMax}
                    onToggle={onToggle}
                    onReject={onReject}
                  />
                </div>
              )}
            </motion.div>
          </Activity>

          <AnimatePresence>
            {isSearching && (
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
            )}
          </AnimatePresence>
        </div>

        <SelectionShelf
          isSearching={isSearching}
          leafById={leafById}
          selectedIds={selectedIds}
          youMightAlsoLike={youMightAlsoLike}
          isAtMax={isAtMax}
          onToggle={onToggle}
          onReject={onReject}
        />
      </div>
    </TooltipProvider>
  );
}

InterestsBrowse.displayName = "InterestsBrowse";
