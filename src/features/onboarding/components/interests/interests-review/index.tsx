import { domMax, LazyMotion, m } from "framer-motion";
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
    <LazyMotion features={domMax}>
      <div className="mx-auto mt-2 flex w-full max-w-xl flex-col px-1 sm:mt-4 sm:px-0">
        {groups.length > 0 && (
          <m.div
            variants={fadeUpItem}
            className="mb-7 border-border border-l pl-4"
          >
            <p className="font-bold font-sans text-muted-foreground text-xs">
              Interest shape
            </p>
            <p className="mt-2 text-pretty font-medium text-ink/82 text-sm leading-relaxed">
              {getInterestShapeSummary(groups, selectedIds.size)}
            </p>
          </m.div>
        )}

        <m.div
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
        </m.div>
      </div>
    </LazyMotion>
  );
}

InterestsReview.displayName = "InterestsReview";
