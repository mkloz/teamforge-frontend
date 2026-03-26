import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { VoronoiCatalyst } from "../auth/components/voronoi-catalyst";
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
  const state = useInterests({
    onComplete: () => {
      window.location.href = "/";
    },
  });

  const progress = Math.min(state.selectedCount / MIN_INTERESTS, 1);

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden bg-canvas lg:bg-white">
      {/* ── Left – Visual Sidebar (Voronoi) ── */}
      <aside className="hidden lg:flex flex-1 relative bg-hero-bg border-r border-slate-200 items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={progress} isTyping={false} />
      </aside>

      {/* ── Right – Interactive Form Pane ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Decorations />
        <BackgroundTexture />

        <div className="flex-1 overflow-y-scroll overflow-x-hidden px-5 pt-1 pb-0">
          <div className="flex flex-col items-center justify-start w-full min-h-full">
            <div className="relative w-full max-w-lg">
              <PersistentHeader state={state} />

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
                        mbtiType={state.mbtiType}
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
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Decorations() {
  return (
    <>
      <div
        className="absolute top-0 left-0 right-0 h-1 lg:hidden bg-linear-to-r from-forge-teal to-amber-400 opacity-80 z-10"
        aria-hidden="true"
      />
      <div
        className="hidden lg:block absolute top-0 left-0 right-0 h-1 bg-forge-teal z-10"
        aria-hidden="true"
      />
    </>
  );
}

function PersistentHeader({ state }: { state: UseInterestsReturn }) {
  if (state.screen === "intro") return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-20 -mx-5 px-5 backdrop-blur-sm bg-white/40 border-b border-slate-100 py-3 transition-opacity duration-300 opacity-100",
      )}
    >
      {state.screen === "browse" && (
        <InterestsBrowseHeader
          searchQuery={state.searchQuery}
          onSetSearch={state.setSearchQuery}
          onExpandCategoryOnly={state.expandCategoryOnly}
        />
      )}
      {state.screen === "review" && (
        <InterestsReviewHeader totalSelected={state.selectedCount} />
      )}
    </div>
  );
}

function InterestsFooter({ state }: { state: UseInterestsReturn }) {
  return (
    <div className="shrink-0 w-full relative z-30">
      {state.screen === "browse" && (
        <div className="px-5 lg:px-0">
          <InterestsProgressBar
            selectedCount={state.selectedCount}
            canContinue={state.canContinue}
            isAtMax={state.isAtMax}
            onContinue={state.goToReview}
          />
        </div>
      )}
      {state.screen === "review" && (
        <InterestsReviewFooter
          onConfirm={state.finalize}
          canConfirm={state.canContinue}
          onBack={state.goToBrowse}
        />
      )}
    </div>
  );
}
