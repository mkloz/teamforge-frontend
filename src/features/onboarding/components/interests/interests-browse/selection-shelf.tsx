import { AnimatePresence, motion } from "framer-motion";
import { Tags, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { Interest } from "@/shared/schemas";
import { TagPill } from "./tag-pill";

interface SelectionShelfProps {
  isSearching: boolean;
  leafById: Record<string, Interest>;
  selectedIds: Set<string>;
  youMightAlsoLike: Interest[];
  isAtMax: boolean;
  onToggle: (id: string) => void;
  onReject: (id: string) => void;
}

export function SelectionShelf({
  isSearching,
  leafById,
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
          className="-mx-4 mt-8 border-slate-muted/10 border-t bg-canvas/30 px-4 pt-6 sm:mx-0 sm:mt-12 sm:px-0 sm:pt-8"
        >
          <div className="mb-4 flex items-center gap-2">
            {isSearching ? (
              <>
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-forge-teal/10 text-forge-teal">
                  <Tags className="h-3 w-3" />
                </div>
                <p className="font-bold font-sans text-[10px] text-forge-teal uppercase tracking-widest">
                  Related to your picks ({youMightAlsoLike.length})
                </p>
              </>
            ) : (
              <p className="font-bold font-sans text-[10px] text-slate-muted/50 uppercase tracking-widest">
                Your picks ({selectedIds.size})
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {isSearching
              ? youMightAlsoLike.map((tag) => (
                  <TagPill
                    key={`search-suggestion-${tag.id}`}
                    label={tag.name}
                    selected={selectedIds.has(tag.id)}
                    disabled={isAtMax}
                    onToggle={() => onToggle(tag.id)}
                    onReject={() => onReject(tag.id)}
                    aliases={tag.aliases}
                    animated
                  />
                ))
              : [...selectedIds].map((id) => {
                  const tag = leafById[id];
                  if (!tag) return null;
                  return (
                    <Button
                      key={`shelf-${id}`}
                      size="xs"
                      onClick={() => onToggle(id)}
                      className="h-auto max-w-full rounded-full px-1.5 py-0.75 text-[11px] sm:px-2 sm:py-1 sm:text-xs"
                    >
                      <span className="min-w-0 max-w-[8.25rem] truncate leading-none sm:max-w-none">
                        {tag.name}
                      </span>
                      <X
                        className="size-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100 sm:size-3.5"
                        strokeWidth={3}
                      />
                    </Button>
                  );
                })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
