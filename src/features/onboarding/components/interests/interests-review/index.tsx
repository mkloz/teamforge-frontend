import { motion } from "framer-motion";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import type { Interest } from "@/shared/schemas";
import { InterestReviewCategory } from "./interest-review-category";
import {
  getInterestReviewGroups,
  getInterestShapeSummary,
} from "./interests-review-model";

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
    <div className="mx-auto mt-2 flex w-full max-w-xl flex-col px-1 sm:mt-4 sm:px-0">
      {groups.length > 0 && (
        <motion.div
          variants={fadeUpItem}
          className="mb-7 border-forge-teal/40 border-l pl-4"
        >
          <p className="font-bold font-sans text-forge-teal text-xs uppercase tracking-widest">
            Interest shape
          </p>
          <p className="mt-2 text-pretty font-medium text-ink/82 text-sm leading-relaxed">
            {getInterestShapeSummary(groups, selectedIds.size)}
          </p>
        </motion.div>
      )}

      <motion.div
        variants={fadeUpItem}
        className="mb-8 flex flex-col gap-6 sm:gap-5"
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
