import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import {
  getLeafInterests,
  getSubcategoryIcon,
} from "../../../lib/interest-catalog";
import type { InterestSearchResults } from "../../../utils/interest-logic";
import { TagPill } from "./tag-pill";

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

  const totalCount = results.tags.length + results.subcategories.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {totalCount === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-muted/5 flex items-center justify-center mb-3 border border-slate-muted/10">
            <Search
              size={20}
              className="text-slate-muted/30"
              strokeWidth={1.5}
            />
          </div>
          <p className="font-sans text-sm font-bold text-slate-muted">
            No results for &ldquo;{query}&rdquo;
          </p>
          <p className="font-sans text-xs text-slate-muted/50 mt-1">
            Try a different word
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-muted/40">
            {totalCount} result{totalCount !== 1 ? "s" : ""}
          </p>

          {/* Subcategory matches – expandable */}
          {results.subcategories.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-muted/50 mb-1">
                Categories
              </p>
              {results.subcategories.map(({ subcategory, category }) => {
                const open = expandedSubs.has(subcategory.id);
                const subSelectedCount = getLeafInterests(subcategory).filter(
                  (interest) => selectedIds.has(interest.id),
                ).length;
                const Icon = getSubcategoryIcon(subcategory.id);

                return (
                  <div
                    key={subcategory.id}
                    className="rounded-xl border border-slate-muted/15 overflow-hidden transition-colors"
                  >
                    <Button
                      variant="ghost"
                      onClick={() => toggleSub(subcategory.id)}
                      className="w-full h-auto justify-start flex items-center gap-2 px-3 py-2.5 rounded-none text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-muted/60">
                          <Icon className="w-5 h-5" strokeWidth={1.5} />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-sans text-xs font-bold text-ink">
                            {subcategory.name}
                          </span>
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-muted/50 leading-none">
                            {category.name}
                          </span>
                        </div>
                      </div>
                      {subSelectedCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto mr-2 shrink-0 flex items-center justify-center min-w-5 h-5 px-1.5 font-sans text-xs font-bold bg-forge-teal text-white rounded-full leading-none shadow-teal-glow"
                        >
                          {subSelectedCount}
                        </motion.span>
                      )}
                      <motion.span
                        animate={{ rotate: open ? 0 : -90 }}
                        transition={{ duration: 0.18 }}
                        className={cn(
                          "shrink-0 text-slate-muted/40 transition-colors group-hover:text-slate-muted transition-none",
                          subSelectedCount === 0 && "ml-auto",
                        )}
                      >
                        <ChevronDown size={14} strokeWidth={2.5} />
                      </motion.span>
                    </Button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-1.5 p-3 pt-4">
                            {getLeafInterests(subcategory).map((tag) => (
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
              })}
            </div>
          )}

          {/* Individual tag matches */}
          {results.tags.length > 0 && (
            <div>
              {results.subcategories.length > 0 && (
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-muted/50 mb-2">
                  Tags
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {results.tags.map(({ tag, matchedAlias }) => (
                  <TagPill
                    key={tag.id}
                    label={
                      matchedAlias
                        ? matchedAlias.charAt(0).toUpperCase() +
                          matchedAlias.slice(1)
                        : tag.name
                    }
                    selected={selectedIds.has(tag.id)}
                    disabled={isAtMax}
                    onToggle={() => onToggle(tag.id)}
                    aliases={
                      matchedAlias && tag.name !== matchedAlias
                        ? [
                            tag.name,
                            ...(tag.aliases?.filter(
                              (a) => a !== matchedAlias,
                            ) ?? []),
                          ]
                        : tag.aliases
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
