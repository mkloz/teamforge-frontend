import { AnimatePresence, motion } from "framer-motion";

import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";
import { PersonalityScreenRenderer } from "@/features/onboarding/components/personality/personality-screen-renderer";
import { usePersonalityTestPageFlow } from "@/features/onboarding/hooks/use-personality-test-page-flow";
import { QUESTIONS_PER_PAGE } from "@/features/onboarding/lib/personality-test-page-constants";

export function PersonalityTestPage() {
  const {
    continueLabel,
    continueToInterests,
    displayProgress,
    scrollContainerRef,
    setPendingLength,
    testState,
  } = usePersonalityTestPageFlow();

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden">
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative h-full scroll-smooth"
        >
          <div className="absolute top-0 left-0 right-0 z-50">
            <TopProgressBar progress={displayProgress} />
          </div>

          <div className="flex flex-col items-center justify-start min-h-full py-4 sm:py-4 px-4 sm:px-6 relative">
            <div className="w-full max-w-xl relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testState.screen.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PersonalityScreenRenderer
                    state={testState}
                    onSelectionChange={setPendingLength}
                    onContinue={continueToInterests}
                    continueLabel={continueLabel}
                    questionsPerPage={QUESTIONS_PER_PAGE}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-hero-bg border-l border-slate-200 items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={testState.progress} />
      </div>
    </div>
  );
}
