export { InterestsReviewFooter } from "./interests-review-footer";
export { InterestsReviewHeader } from "./interests-review-header";
import type { Interest } from "@/shared/schemas";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { fadeUpItem } from "../../../constants/motion";
import {
  getCategoryColorClass,
  getLeafInterests,
  getSubcategories,
} from "../../../lib/interest-catalog";

interface InterestsReviewProps {
  categories: Interest[];
  leafById: Record<string, Interest>;
  selectedIds: Set<string>;
  onRemove: (id: string) => void;
}

export function InterestsReview({
  categories,
  leafById,
  selectedIds,
  onRemove,
}: InterestsReviewProps) {
  const groups = categories
    .map((category) => {
      const tagIds = Array.from(selectedIds).filter((id) => {
        const tag = leafById[id];

        return (
          tag &&
          getSubcategories(category).some((subcategory) =>
            getLeafInterests(subcategory).some(
              (interest) => interest.id === id,
            ),
          )
        );
      });

      return { category, tagIds };
    })
    .filter((group) => group.tagIds.length > 0);

  return (
    <div className="flex flex-col max-w-xl mx-auto w-full mt-2 sm:mt-4 px-1 sm:px-0">
      {/* Grouped tags */}
      <motion.div
        variants={fadeUpItem}
        className="flex flex-col gap-6 sm:gap-5 mb-8"
      >
        {groups.map(({ category, tagIds }) => (
          <div
            key={category.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full shadow-sm",
                  getCategoryColorClass(category.id),
                )}
              />
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-slate-muted/60">
                {category.name}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {tagIds.map((id) => {
                const tag = leafById[id];
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
                      <span className="leading-none">{tag.name}</span>
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
        ))}
      </motion.div>
    </div>
  );
}

InterestsReview.displayName = "InterestsReview";
