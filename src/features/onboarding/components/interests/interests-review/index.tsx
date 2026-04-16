export { InterestsReviewFooter } from "./interests-review-footer";
export { InterestsReviewHeader } from "./interests-review-header";
import { Button } from "@/shared/components/ui/button";
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
                    "w-1.5 h-1.5 rounded-full shadow-sm",
                    category.color,
                  )}
                />
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-slate-muted/60">
                  {category.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {tagIds.map((id) => {
                  const tag = LEAF_TAG_BY_ID[id];
                  if (!tag) return null;
                  return (
                    <Button
                      key={id}
                      size="xs"
                      asChild
                      className="rounded-full shadow-xs"
                    >
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => onRemove(id)}
                      >
                        <span className="leading-none">{tag.label}</span>
                        <X
                          size={14}
                          className="opacity-60 group-hover:opacity-100 transition-opacity"
                          strokeWidth={3}
                        />
                      </motion.button>
                    </Button>
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
