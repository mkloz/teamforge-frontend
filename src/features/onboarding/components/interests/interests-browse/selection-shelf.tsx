import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { LEAF_TAG_BY_ID } from "../../../data/interests-data";
import type { LeafTag } from "../../../data/interests-types";
import { TagPill } from "./tag-pill";

interface SelectionShelfProps {
  isSearching: boolean;
  selectedIds: Set<string>;
  youMightAlsoLike: LeafTag[];
  isAtMax: boolean;
  onToggle: (id: string) => void;
  onReject: (id: string) => void;
}

export function SelectionShelf({
  isSearching,
  selectedIds,
  youMightAlsoLike,
  isAtMax,
  onToggle,
  onReject,
}: SelectionShelfProps) {
  const showShelf = isSearching
    ? youMightAlsoLike.length > 0
    : selectedIds.size > 0;

  return (
    <AnimatePresence mode="wait">
      {showShelf && (
        <motion.div
          key={isSearching ? "shelf-suggestions" : "shelf-selections"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-muted/10 bg-canvas/30 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          <div className="flex items-center gap-2 mb-4">
            {isSearching ? (
              <>
                <div className="w-5 h-5 rounded-md bg-forge-teal/10 flex items-center justify-center text-forge-teal">
                  <Sparkles className="h-3 w-3" />
                </div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-forge-teal">
                  Suggested from choices ({youMightAlsoLike.length})
                </p>
              </>
            ) : (
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-muted/50">
                Your Selections ({selectedIds.size})
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isSearching
              ? youMightAlsoLike.map((tag) => (
                  <TagPill
                    key={`search-suggestion-${tag.id}`}
                    label={tag.label}
                    selected={selectedIds.has(tag.id)}
                    disabled={isAtMax}
                    onToggle={() => onToggle(tag.id)}
                    onReject={() => onReject(tag.id)}
                    aliases={tag.aliases}
                    animated
                  />
                ))
              : [...selectedIds].map((id) => {
                  const tag = LEAF_TAG_BY_ID[id];
                  if (!tag) return null;
                  return (
                    <button
                      key={`shelf-${id}`}
                      type="button"
                      onClick={() => onToggle(id)}
                      className="group flex items-center gap-1.5 rounded-full bg-forge-teal text-white px-3.5 py-1.5 text-xs font-bold shadow-sm hover:bg-teal-600 transition active:scale-95"
                    >
                      {tag.label}
                      <X
                        size={14}
                        className="opacity-60 group-hover:opacity-100 transition-opacity"
                        strokeWidth={3}
                      />
                    </button>
                  );
                })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
