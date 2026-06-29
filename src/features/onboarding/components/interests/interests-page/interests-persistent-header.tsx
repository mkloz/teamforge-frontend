import {
  domAnimation,
  LazyMotion,
  m,
  useScroll,
  useTransform,
} from "framer-motion";
import type { RefObject } from "react";

import { InterestsBrowseHeader } from "@/features/onboarding/components/interests/interests-browse/interests-browse-header";
import { InterestsReviewHeader } from "@/features/onboarding/components/interests/interests-review/interests-review-header";
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
        "sticky z-40 w-full border-slate-muted/10 border-b bg-canvas/90 pt-3 shadow-none backdrop-blur-sm",
        state.screen === "browse" ? "-top-10" : "top-0 shadow-sm",
      )}
    >
      <div className="mx-auto max-w-xl px-4 sm:px-5 lg:px-0">
        {state.screen === "browse" && (
          <div className="mb-1 flex flex-col">
            <LazyMotion features={domAnimation}>
              <m.div style={{ opacity: headerOpacity }}>
                <InterestsBrowseHeader
                  categories={state.categories}
                  searchQuery={state.searchQuery}
                  onSetSearch={state.setSearchQuery}
                  onQuickJumpCategory={state.jumpToCategory}
                  variant="pills"
                />
              </m.div>
            </LazyMotion>

            <InterestsBrowseHeader
              categories={state.categories}
              searchQuery={state.searchQuery}
              onSetSearch={state.setSearchQuery}
              onQuickJumpCategory={state.jumpToCategory}
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
