import { AnimatePresence, m } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";
import { Button } from "@/shared/components/ui/button";
import { CountBadge } from "@/shared/components/ui/count-badge";
import { cn } from "@/shared/lib/utils";

import { TagPill } from "../tag-pill";
import {
  getSearchResultSubcategorySelectedCount,
  getSearchResultSubcategoryTags,
} from "./search-result-subcategories-model";
import { SearchResultSubcategoryIcon } from "./search-result-subcategory-icon";

interface SearchResultSubcategoriesProps {
  expandedSubcategories: Set<string>;
  isAtMax: boolean;
  onToggle: (id: string) => void;
  onToggleSubcategory: (id: string) => void;
  results: InterestSearchResults;
  selectedIds: Set<string>;
}

export function SearchResultSubcategories({
  expandedSubcategories,
  isAtMax,
  onToggle,
  onToggleSubcategory,
  results,
  selectedIds,
}: SearchResultSubcategoriesProps) {
  if (results.subcategories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-1 font-bold font-sans text-slate-muted/50 text-xs">
        Categories
      </p>
      {results.subcategories.map(({ subcategory, category }) => (
        <SearchResultSubcategoryItem
          key={subcategory.id}
          categoryName={category.name}
          expanded={expandedSubcategories.has(subcategory.id)}
          isAtMax={isAtMax}
          onToggle={onToggle}
          onToggleExpanded={() => onToggleSubcategory(subcategory.id)}
          selectedIds={selectedIds}
          subcategory={subcategory}
        />
      ))}
    </div>
  );
}

interface SearchResultSubcategoryItemProps {
  categoryName: string;
  expanded: boolean;
  isAtMax: boolean;
  onToggle: (id: string) => void;
  onToggleExpanded: () => void;
  selectedIds: Set<string>;
  subcategory: InterestSearchResults["subcategories"][number]["subcategory"];
}

function SearchResultSubcategoryItem({
  categoryName,
  expanded,
  isAtMax,
  onToggle,
  onToggleExpanded,
  selectedIds,
  subcategory,
}: SearchResultSubcategoryItemProps) {
  const tags = getSearchResultSubcategoryTags(subcategory);
  const selectedCount = getSearchResultSubcategorySelectedCount(
    subcategory,
    selectedIds,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-muted/15 transition-colors">
      <Button
        variant="ghost"
        onClick={onToggleExpanded}
        className="group flex h-auto w-full min-w-0 items-center justify-start gap-2 rounded-lg px-3 py-2.5 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-slate-muted/60">
            <SearchResultSubcategoryIcon subcategoryId={subcategory.id} />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-bold font-sans text-ink text-xs">
              {subcategory.name}
            </span>
            <span className="truncate font-bold font-sans text-slate-muted/50 text-xs leading-none">
              {categoryName}
            </span>
          </div>
        </div>
        {selectedCount > 0 && (
          <m.span
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mr-2 ml-auto shrink-0"
          >
            <CountBadge
              count={selectedCount}
              size="md"
              tone="teal"
              className="shadow-teal-glow"
            />
          </m.span>
        )}
        <m.span
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "shrink-0 text-slate-muted/40 transition-colors transition-none group-hover:text-slate-muted",
            selectedCount === 0 && "ml-auto",
          )}
        >
          <ChevronDown size={14} strokeWidth={2.5} />
        </m.span>
      </Button>
      <AnimatePresence initial={false}>
        {expanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 p-3 pt-4">
              {tags.map((tag) => (
                <TagPill
                  key={tag.id}
                  label={tag.name}
                  selected={selectedIds.has(tag.id)}
                  disabled={isAtMax}
                  onToggle={() => onToggle(tag.id)}
                  aliases={tag.aliases}
                />
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
