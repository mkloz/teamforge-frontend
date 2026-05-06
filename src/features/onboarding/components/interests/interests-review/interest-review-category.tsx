import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Interest } from "@/shared/schemas";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { getCategoryColorClass } from "@/features/onboarding/lib/interest-catalog";

interface InterestReviewCategoryProps {
  category: Interest;
  leafById: Record<string, Interest>;
  tagIds: string[];
  onRemove: (id: string) => void;
}

export function InterestReviewCategory({
  category,
  leafById,
  tagIds,
  onRemove,
}: InterestReviewCategoryProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
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
      <div className="flex flex-wrap gap-1 sm:gap-1.5">
        {tagIds.map((id) => {
          const tag = leafById[id];

          if (!tag) {
            return null;
          }

          return (
            <Button
              key={id}
              size="xs"
              asChild
              className="h-auto max-w-full rounded-full px-1.5 py-0.75 text-[11px] shadow-xs sm:px-2 sm:py-1 sm:text-xs"
            >
              <motion.button
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onRemove(id)}
                className="min-w-0"
              >
                <span className="min-w-0 max-w-[8.25rem] truncate leading-none sm:max-w-none">
                  {tag.name}
                </span>
                <X
                  className="size-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100 sm:size-3.5"
                  strokeWidth={3}
                />
              </motion.button>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
