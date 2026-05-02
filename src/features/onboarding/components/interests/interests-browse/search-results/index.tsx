import { motion } from "framer-motion";
import { useState } from "react";
import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";

import { SearchEmptyState } from "./search-empty-state";
import {
  formatSearchResultCount,
  getSearchResultsCount,
} from "./search-results-count";
import { SearchResultSubcategories } from "./search-result-subcategories";
import { SearchResultTags } from "./search-result-tags";

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
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const toggleSub = (id: string) =>
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

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
          <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-muted/40">
            {formatSearchResultCount(totalCount)}
          </p>
          <SearchResultSubcategories
            expandedSubcategories={expandedSubs}
            isAtMax={isAtMax}
            onToggle={onToggle}
            onToggleSubcategory={toggleSub}
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
