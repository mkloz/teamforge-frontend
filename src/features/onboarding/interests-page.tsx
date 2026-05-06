import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { AnimatePresence } from "framer-motion";
import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";
import { CompletionBlueprint } from "@/features/onboarding/components/interests/interests-page/completion-blueprint";
import { InterestsFooter } from "@/features/onboarding/components/interests/interests-page/interests-footer";
import { InterestsPersistentHeader } from "@/features/onboarding/components/interests/interests-page/interests-persistent-header";
import { InterestsProgressDecoration } from "@/features/onboarding/components/interests/interests-page/interests-progress-decoration";
import { InterestsScreenRenderer } from "@/features/onboarding/components/interests/interests-page/interests-screen-renderer";
import { useInterestsPageFlow } from "@/features/onboarding/hooks/use-interests-page-flow";

export function InterestsPage() {
  const {
    backLabel,
    enterApp,
    goBack,
    isDone,
    isEditMode,
    progress,
    scrollContainerRef,
    state,
  } = useInterestsPageFlow();

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden">
      <aside className="hidden lg:flex flex-1 relative bg-hero-bg border-r border-slate-muted/10 items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={progress} />
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-canvas">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-scroll overflow-x-hidden pb-0 scroll-smooth relative z-10"
        >
          <InterestsProgressDecoration progress={progress} />
          <InterestsPersistentHeader
            state={state}
            scrollRef={scrollContainerRef}
          />

          <div className="flex flex-col items-center justify-start w-full min-h-full py-6 sm:py-0">
            <div className="relative w-full max-w-xl lg:px-0 px-4 sm:px-5">
              <div className="relative w-full">
                <InterestsScreenRenderer
                  state={state}
                  backLabel={backLabel}
                  onBack={goBack}
                  isEditMode={isEditMode}
                />
              </div>
            </div>
          </div>
        </div>

        <InterestsFooter
          state={state}
          backLabel={backLabel}
          isEditMode={isEditMode}
          onBack={goBack}
        />
      </main>

      <AnimatePresence>
        {isDone && (
          <CompletionBlueprint
            personalityType={state.personalityType}
            interestCount={state.selectedCount}
            onEnter={enterApp}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
