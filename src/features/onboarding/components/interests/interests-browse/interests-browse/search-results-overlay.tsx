import { m } from "framer-motion";
import type { SearchResultsOverlayProps } from "@/features/onboarding/components/interests/interests-browse/interests-browse/types";
import { SearchResults } from "@/features/onboarding/components/interests/interests-browse/search-results";

export function SearchResultsOverlay({
  isAtMax,
  searchQuery,
  searchResults,
  selectedIds,
  onToggle,
}: SearchResultsOverlayProps) {
  return (
    <m.div
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
    </m.div>
  );
}
