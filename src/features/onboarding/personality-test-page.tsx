import { AnimatePresence, motion } from "framer-motion";

import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";
import { OnboardingHomeLink } from "@/features/onboarding/components/onboarding-home-link";
import { personalityScreenTransition } from "@/features/onboarding/constants/motion";
import { PersonalityScreenRenderer } from "@/features/onboarding/components/personality/personality-screen-renderer";
import { usePersonalityTestPageFlow } from "@/features/onboarding/hooks/use-personality-test-page-flow";
import { QUESTIONS_PER_PAGE } from "@/features/onboarding/lib/personality-test-page-constants";
import { cn } from "@/shared/lib/utils";

export function PersonalityTestPage() {
  const {
    backLabel,
    continueLabel,
    continueToInterests,
    displayProgress,
    goBack,
    scrollContainerRef,
    setPendingLength,
    testState,
  } = usePersonalityTestPageFlow();
  const hasTopPadding =
    testState.screen.id !== "questions" &&
    testState.screen.id !== "results" &&
    testState.screen.id !== "calculating";
  const screenTransitionKey = getPersonalityScreenTransitionKey(
    testState.screen,
  );

  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <BackgroundTexture />
        {testState.screen.id !== "questions" ? <OnboardingHomeLink /> : null}

        <div
          ref={scrollContainerRef}
          className="relative h-full flex-1 overflow-x-hidden overflow-y-auto scroll-smooth"
        >
          <div className="absolute top-0 right-0 left-0 z-50">
            <TopProgressBar progress={displayProgress} />
          </div>

          <div
            className={cn(
              "relative flex min-h-full flex-col items-center justify-start px-4 pb-4 sm:px-6 sm:pb-4",
              hasTopPadding ? "pt-7 sm:pt-12" : "pt-4 sm:pt-4",
            )}
          >
            <div className="relative flex w-full max-w-xl flex-1 flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={screenTransitionKey}
                  variants={personalityScreenTransition}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-1 flex-col"
                >
                  <PersonalityScreenRenderer
                    state={testState}
                    backLabel={backLabel}
                    onBack={goBack}
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

      <div className="hidden h-full flex-1 items-center justify-center overflow-hidden border-l border-slate-200 bg-hero-bg lg:flex">
        <VoronoiCatalyst progress={testState.progress} />
      </div>
    </div>
  );
}

function getPersonalityScreenTransitionKey(
  screen: ReturnType<typeof usePersonalityTestPageFlow>["testState"]["screen"],
) {
  if (screen.id === "questions") {
    return `questions-${screen.currentPage}`;
  }

  if (screen.id === "intermission") {
    return `intermission-${screen.type}`;
  }

  return screen.id;
}
