import { motion } from "framer-motion";
import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";

import { SearchEmptyState } from "./search-empty-state";
import {
  formatSearchResultCount,
  getSearchResultsCount,
} from "./search-results-count";
import { SearchResultSubcategories } from "./search-result-subcategories";
import { SearchResultTags } from "./search-result-tags";
import { useSearchResultExpansion } from "./use-search-result-expansion";

export function SearchResults({
  query,
  results,
  selectedIds,
  isAtMax,
  onToggle,
}: {
  query: string;
  results: InterestSearchResults;
  selectedIds: Set<string>;
  isAtMax: boolean;
  onToggle: (id: string) => void;
}) {
  const { expandedSubcategories, toggleSubcategory } =
    useSearchResultExpansion();
  const totalCount = getSearchResultsCount(results);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {totalCount === 0 ? (
        <SearchEmptyState query={query} />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="font-sans text-[10px] font-bold tracking-wider text-slate-muted/40 uppercase">
            {formatSearchResultCount(totalCount)}
          </p>
          <SearchResultSubcategories
            expandedSubcategories={expandedSubcategories}
            isAtMax={isAtMax}
            onToggle={onToggle}
            onToggleSubcategory={toggleSubcategory}
            results={results}
            selectedIds={selectedIds}
          />
          <SearchResultTags
            isAtMax={isAtMax}
            onToggle={onToggle}
            results={results}
            selectedIds={selectedIds}
          />
        </div>
      )}
    </motion.div>
  );
}
