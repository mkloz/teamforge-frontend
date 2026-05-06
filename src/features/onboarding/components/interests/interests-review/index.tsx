import type { Interest } from "@/shared/schemas";
import { motion } from "framer-motion";

import { fadeUpItem } from "@/features/onboarding/constants/motion";
import {
  getInterestReviewGroups,
  getInterestShapeSummary,
} from "./interests-review-model";
import { InterestReviewCategory } from "./interest-review-category";

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
  const groups = getInterestReviewGroups({
    categories,
    leafById,
    selectedIds,
  });

  return (
    <div className="flex flex-col max-w-xl mx-auto w-full mt-2 sm:mt-4 px-1 sm:px-0">
      {groups.length > 0 && (
        <motion.div
          variants={fadeUpItem}
          className="mb-7 border-l border-forge-teal/40 pl-4"
        >
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-forge-teal">
            Interest shape
          </p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-ink/82 text-pretty">
            {getInterestShapeSummary(groups, selectedIds.size)}
          </p>
        </motion.div>
      )}

      <motion.div
        variants={fadeUpItem}
        className="flex flex-col gap-6 sm:gap-5 mb-8"
      >
        {groups.map(({ category, tagIds }) => (
          <InterestReviewCategory
            key={category.id}
            category={category}
            leafById={leafById}
            tagIds={tagIds}
            onRemove={onRemove}
          />
        ))}
      </motion.div>
    </div>
  );
}

InterestsReview.displayName = "InterestsReview";
