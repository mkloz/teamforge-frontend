import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { createElement } from "react";

import {
  getLeafInterests,
  getSubcategoryIcon,
} from "@/features/onboarding/lib/interest-catalog";
import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";

import { TagPill } from "../tag-pill";

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
      <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-muted/50 mb-1">
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
  const leafInterests = getLeafInterests(subcategory);
  const selectedCount = leafInterests.filter((interest) =>
    selectedIds.has(interest.id),
  ).length;

  return (
    <div className="rounded-xl border border-slate-muted/15 overflow-hidden transition-colors">
      <Button
        variant="ghost"
        onClick={onToggleExpanded}
        className="w-full h-auto justify-start flex items-center gap-2 px-3 py-2.5 rounded-none text-left group"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-muted/60">
            {renderSubcategoryIcon(subcategory.id)}
          </span>
          <div className="flex flex-col">
            <span className="font-sans text-xs font-bold text-ink">
              {subcategory.name}
            </span>
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-muted/50 leading-none">
              {categoryName}
            </span>
          </div>
        </div>
        {selectedCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto mr-2 shrink-0 flex items-center justify-center min-w-5 h-5 px-1.5 font-sans text-xs font-bold bg-forge-teal text-white rounded-full leading-none shadow-teal-glow"
          >
            {selectedCount}
          </motion.span>
        )}
        <motion.span
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "shrink-0 text-slate-muted/40 transition-colors group-hover:text-slate-muted transition-none",
            selectedCount === 0 && "ml-auto",
          )}
        >
          <ChevronDown size={14} strokeWidth={2.5} />
        </motion.span>
      </Button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 p-3 pt-4">
              {leafInterests.map((tag) => (
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function renderSubcategoryIcon(subcategoryId: string) {
  return createElement(getSubcategoryIcon(subcategoryId), {
    className: "w-5 h-5",
    strokeWidth: 1.5,
  });
}
