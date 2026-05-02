import { motion, useScroll, useTransform } from "framer-motion";
import type { RefObject } from "react";

import { InterestsBrowseHeader } from "@/features/onboarding/components/interests/interests-browse";
import { InterestsReviewHeader } from "@/features/onboarding/components/interests/interests-review";
import type { UseInterestsReturn } from "@/features/onboarding/hooks/use-interests";
import { cn } from "@/shared/lib/utils";

interface InterestsPersistentHeaderProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  state: UseInterestsReturn;
}

export function InterestsPersistentHeader({
  scrollRef,
  state,
}: InterestsPersistentHeaderProps) {
  const { scrollY } = useScroll({
    container: scrollRef,
  });

  const headerOpacity = useTransform(scrollY, [0, 40], [1, 0]);

  if (state.screen === "intro") return null;

  return (
    <div
      className={cn(
        "sticky z-40 w-full border-b bg-canvas/90 border-slate-muted/10 pt-3 backdrop-blur-sm shadow-none",
        state.screen === "browse" ? "-top-10" : "top-0 shadow-sm",
      )}
    >
      <div className="max-w-xl mx-auto lg:px-0 px-4 sm:px-5">
        {state.screen === "browse" && (
          <div className="flex flex-col mb-1">
            <motion.div style={{ opacity: headerOpacity }}>
              <InterestsBrowseHeader
                categories={state.categories}
                searchQuery={state.searchQuery}
                onSetSearch={state.setSearchQuery}
                onExpandCategoryOnly={state.expandCategoryOnly}
                variant="pills"
              />
            </motion.div>

            <InterestsBrowseHeader
              categories={state.categories}
              searchQuery={state.searchQuery}
              onSetSearch={state.setSearchQuery}
              onExpandCategoryOnly={state.expandCategoryOnly}
              variant="search"
            />
          </div>
        )}

        {state.screen === "review" && (
          <InterestsReviewHeader totalSelected={state.selectedCount} />
        )}
      </div>
    </div>
  );
}
