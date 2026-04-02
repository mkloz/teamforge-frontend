export { InterestsReviewFooter } from "./interests-review-footer";
export { InterestsReviewHeader } from "./interests-review-header";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { fadeUpItem } from "../../../constants/motion";
import {
  INTEREST_CATEGORIES,
  LEAF_TAG_BY_ID,
} from "../../../data/interests-data";
import type { Category } from "../../../data/interests-types";

interface InterestsReviewProps {
  selectedIds: Set<string>;
  onRemove: (id: string) => void;
}

export function InterestsReview({
  selectedIds,
  onRemove,
}: InterestsReviewProps) {
  // Build grouped structure: only categories that have ≥1 selected tag
  const groups = INTEREST_CATEGORIES.map((cat: Category) => {
    const tagIds = Array.from(selectedIds).filter((id: string) => {
      const tag = LEAF_TAG_BY_ID[id];
      return (
        tag &&
        cat.subcategories.some((sub) => sub.tags.some((t) => t.id === id))
      );
    });
    return { category: cat, tagIds };
  }).filter((g: { tagIds: string[] }) => g.tagIds.length > 0);

  return (
    <div className="flex flex-col max-w-xl mx-auto w-full mt-2 sm:mt-4 px-1 sm:px-0">
      {/* Grouped tags */}
      <motion.div
        variants={fadeUpItem}
        className="flex flex-col gap-6 sm:gap-5 mb-8"
      >
        {groups.map(
          ({ category, tagIds }: { category: Category; tagIds: string[] }) => (
            <div
              key={category.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full shadow-xs",
                    category.color,
                  )}
                />
                <span className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
                  {category.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {tagIds.map((id) => {
                  const tag = LEAF_TAG_BY_ID[id];
                  if (!tag) return null;
                  return (
                    <motion.div
                      key={id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-flex items-center gap-1 bg-forge-teal/8 border border-forge-teal/10 text-forge-teal rounded-full pl-3 pr-1 py-1.5 text-xs font-bold font-sans transition-colors hover:bg-forge-teal/15"
                    >
                      <span className="leading-none">{tag.label}</span>
                      <button
                        type="button"
                        onClick={() => onRemove(id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-forge-teal/20 transition-all ml-0.5 -mr-0.5 active:scale-90"
                        aria-label={`Remove ${tag.label}`}
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ),
        )}
      </motion.div>
    </div>
  );
}

InterestsReview.displayName = "InterestsReview";
