export { InterestsBrowseHeader } from "./interests-browse-header";
import { Accordion } from "@/shared/components/ui/accordion";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "react";
import { INTEREST_CATEGORIES } from "../../../data/interests-data";
import type {
  LeafTag,
  MbtiType,
  SearchResults as SearchResultsType,
} from "../../../data/interests-types";
import { BalanceNudge } from "./balance-nudge";
import { CategorySection } from "./category-section";
import { PageTitle } from "./page-title";
import { SearchResults } from "./search-results";
import { SelectionShelf } from "./selection-shelf";
import { SuggestionsSection } from "./suggestions-section";
import { YouMightAlsoLikeSection } from "./you-might-also-like-section";

interface InterestsBrowseProps {
  selectedIds: Set<string>;
  searchQuery: string;
  searchResults: SearchResultsType;
  mbtiType: MbtiType | null;
  suggestedTags: LeafTag[];
  youMightAlsoLike: LeafTag[];
  showBalanceNudge: boolean;
  isAtMax: boolean;
  collapsedCategories: Set<string>;
  expandedSubcategories: Set<string>;
  onToggle: (id: string) => void;
  onToggleCategory: (id: string) => void;
  onExpandCategoryOnly: (id: string) => void;
  onToggleSubcategory: (id: string) => void;
  onSetSearch: (q: string) => void;
  onReject: (id: string) => void;
}

export function InterestsBrowse({
  selectedIds,
  searchQuery,
  searchResults,
  mbtiType,
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
}: Omit<InterestsBrowseProps, "onSetSearch" | "onExpandCategoryOnly">) {
  const isSearching = searchQuery.trim().length >= 2;

  const openCategories = INTEREST_CATEGORIES.map((c) => c.id).filter(
    (id) => !collapsedCategories.has(id),
  );

  function handleAccordionChange(newValues: string[]) {
    const toggled = INTEREST_CATEGORIES.map((c) => c.id).find((id) => {
      const wasOpen = openCategories.includes(id);
      const isOpenNow = newValues.includes(id);
      return wasOpen !== isOpenNow;
    });
    if (toggled) onToggleCategory(toggled);
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col w-full max-w-xl mx-auto pb-8">
        <PageTitle isSearching={isSearching} />

        <div className="relative w-full">
          <Activity mode={isSearching ? "hidden" : "visible"}>
            <motion.div
              layout="position"
              animate={{ opacity: isSearching ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex flex-col space-y-2",
                isSearching && "pointer-events-none",
              )}
            >
              {/* Contextual Sections */}
              {mbtiType && suggestedTags.length > 0 && (
                <SuggestionsSection
                  mbtiType={mbtiType}
                  suggestedTags={suggestedTags}
                  selectedIds={selectedIds}
                  isAtMax={isAtMax}
                  onToggle={onToggle}
                  onReject={onReject}
                />
              )}

              {showBalanceNudge && <BalanceNudge />}

              {selectedIds.size > 0 && youMightAlsoLike.length > 0 && (
                <YouMightAlsoLikeSection
                  tags={youMightAlsoLike}
                  selectedIds={selectedIds}
                  isAtMax={isAtMax}
                  onToggle={onToggle}
                  onReject={onReject}
                />
              )}

              {/* Main Categories */}
              <Accordion
                type="multiple"
                value={openCategories}
                onValueChange={handleAccordionChange}
              >
                {INTEREST_CATEGORIES.map((cat) => (
                  <CategorySection
                    key={cat.id}
                    category={cat}
                    selectedIds={selectedIds}
                    expandedSubcategories={expandedSubcategories}
                    isAtMax={isAtMax}
                    onToggleSubcategory={onToggleSubcategory}
                    onToggleTag={onToggle}
                  />
                ))}
              </Accordion>
            </motion.div>
          </Activity>

          {/* Search Results Layer */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                key="search-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
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

        {/* Dynamic Selection/Suggestions Shelf */}
        <SelectionShelf
          isSearching={isSearching}
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
