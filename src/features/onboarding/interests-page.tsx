import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { cn } from "@/shared/lib/utils";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import { VoronoiCatalyst } from "../auth/components/voronoi-catalyst";
import { CompletionBlueprint } from "./components/completion-blueprint";
import {
  InterestsBrowse,
  InterestsBrowseHeader,
} from "./components/interests/interests-browse";
import { InterestsProgressBar } from "./components/interests/interests-browse/interests-progress-bar";
import { InterestsIntro } from "./components/interests/interests-intro";
import {
  InterestsReview,
  InterestsReviewFooter,
  InterestsReviewHeader,
} from "./components/interests/interests-review";
import { MIN_INTERESTS } from "./data/interests-data";
import { useInterests, type UseInterestsReturn } from "./hooks/use-interests";

export function InterestsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);

  const state = useInterests({
    onComplete: () => {
      setIsDone(true);
    },
  });

  // Auto-scroll on screen change
  useScrollToTop([state.screen], scrollContainerRef);

  const progress = Math.min(state.selectedCount / MIN_INTERESTS, 1);

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden">
      {/* ── Left – Visual Sidebar (Voronoi) ── */}
      <aside className="hidden lg:flex flex-1 relative bg-hero-bg border-r border-slate-muted/10 items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={progress} />
      </aside>

      {/* ── Right – Interactive Form Pane ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-canvas">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-scroll overflow-x-hidden pb-0 scroll-smooth relative z-10"
        >
          <Decorations progress={progress} />
          <PersistentHeader state={state} scrollRef={scrollContainerRef} />

          <div className="flex flex-col items-center justify-start w-full min-h-full py-6 sm:py-0">
            <div className="relative w-full max-w-xl lg:px-0 px-4 sm:px-5">
              <div className="relative w-full">
                <AnimatePresence mode="wait" initial={false}>
                  {state.screen === "intro" && (
                    <motion.div
                      key="intro"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <InterestsIntro
                        onStart={() => state.setScreen("browse")}
                      />
                    </motion.div>
                  )}

                  {state.screen === "browse" && (
                    <motion.div
                      key="browse"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                    >
                      <InterestsBrowse
                        selectedIds={state.selectedIds}
                        searchQuery={state.searchQuery}
                        searchResults={state.searchResults}
                        personalityType={state.personalityType}
                        suggestedTags={state.suggestedTags}
                        youMightAlsoLike={state.youMightAlsoLike}
                        showBalanceNudge={state.showBalanceNudge}
                        isAtMax={state.isAtMax}
                        collapsedCategories={state.collapsedCategories}
                        expandedSubcategories={state.expandedSubcategories}
                        onToggle={state.toggle}
                        onReject={state.reject}
                        onToggleCategory={state.toggleCategory}
                        onToggleSubcategory={state.toggleSubcategory}
                      />
                    </motion.div>
                  )}

                  {state.screen === "review" && (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                    >
                      <InterestsReview
                        selectedIds={state.selectedIds}
                        onRemove={state.toggle}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <InterestsFooter state={state} />
      </main>

      {/* ── Success Overlay (Blueprint) ── */}
      <AnimatePresence>
        {isDone && (
          <CompletionBlueprint
            personalityType={state.personalityType}
            interestCount={state.selectedCount}
            onEnter={() => {
              window.location.href = "/home";
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export function Decorations({ progress }: { progress: number }) {
  return (
    <TopProgressBar
      progress={progress}
      className="-mx-4 sm:-mx-5 -mt-1 w-[calc(100%+32px)] sm:w-[calc(100%+40px)] sticky top-0 z-50"
    />
  );
}

function PersistentHeader({
  state,
  scrollRef,
}: {
  state: UseInterestsReturn;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
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
            {/* Tier 1: Pills */}
            <motion.div style={{ opacity: headerOpacity }}>
              <InterestsBrowseHeader
                searchQuery={state.searchQuery}
                onSetSearch={state.setSearchQuery}
                onExpandCategoryOnly={state.expandCategoryOnly}
                variant="pills"
              />
            </motion.div>

            {/* Tier 2: Search */}
            <InterestsBrowseHeader
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

function InterestsFooter({ state }: { state: UseInterestsReturn }) {
  return (
    <div className="shrink-0 w-full relative z-30 bg-canvas border-t border-slate-muted/10">
      <div className="max-w-xl mx-auto lg:px-0 px-4 sm:px-5 w-full">
        {state.screen === "browse" && (
          <InterestsProgressBar
            selectedCount={state.selectedCount}
            canContinue={state.canContinue}
            isAtMax={state.isAtMax}
            onContinue={state.goToReview}
          />
        )}
        {state.screen === "review" && (
          <InterestsReviewFooter
            onConfirm={state.finalize}
            canConfirm={state.canContinue}
            onBack={state.goToBrowse}
          />
        )}
      </div>
    </div>
  );
}
