import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import type { SearchResults as SearchResultsType } from "../../../data/interests-types";
import { TagPill } from "./tag-pill";

export function SearchResults({
  query,
  results,
  selectedIds,
  isAtMax,
  onToggle,
}: {
  query: string;
  results: SearchResultsType;
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
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Search size={20} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="font-sans text-sm font-medium text-slate-400">
            No results for &ldquo;{query}&rdquo;
          </p>
          <p className="font-sans text-xs text-slate-300 mt-1">
            Try a different word
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="font-sans text-xs text-slate-400">
            {totalCount} result{totalCount !== 1 ? "s" : ""}
          </p>

          {/* Subcategory matches – expandable */}
          {results.subcategories.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Categories
              </p>
              {results.subcategories.map(({ sub, categoryLabel }) => {
                const open = expandedSubs.has(sub.id);
                const subSelectedCount = sub.tags.filter((t) =>
                  selectedIds.has(t.id),
                ).length;
                return (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-slate-200 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSub(sub.id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">
                          {sub.emoji}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-sans text-xs font-semibold text-slate-700">
                            {sub.label}
                          </span>
                          <span className="font-sans text-[10px] text-slate-400 leading-none">
                            {categoryLabel}
                          </span>
                        </div>
                      </div>
                      {subSelectedCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto mr-2 shrink-0 flex items-center justify-center min-w-5 h-5 px-1.5 font-sans text-[10px] font-black bg-forge-teal text-white rounded-full leading-none shadow-[0_2px_4px_rgba(13,148,136,0.2)]"
                        >
                          {subSelectedCount}
                        </motion.span>
                      )}
                      <motion.span
                        animate={{ rotate: open ? 0 : -90 }}
                        transition={{ duration: 0.18 }}
                        className={cn(
                          "shrink-0 text-slate-400 transition-colors group-hover:text-slate-500",
                          subSelectedCount === 0 && "ml-auto",
                        )}
                      >
                        <ChevronDown size={13} strokeWidth={2.5} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-1.5 p-3">
                            {sub.tags.map((tag) => (
                              <TagPill
                                key={tag.id}
                                label={tag.label}
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
                <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
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
                        : tag.label
                    }
                    selected={selectedIds.has(tag.id)}
                    disabled={isAtMax}
                    onToggle={() => onToggle(tag.id)}
                    aliases={
                      matchedAlias && tag.label !== matchedAlias
                        ? [
                            tag.label,
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
