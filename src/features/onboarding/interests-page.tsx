import { AnimatePresence } from "framer-motion";
import { CompletionBlueprint } from "@/features/onboarding/components/interests/interests-page/completion-blueprint";
import { InterestsFooter } from "@/features/onboarding/components/interests/interests-page/interests-footer";
import { InterestsPersistentHeader } from "@/features/onboarding/components/interests/interests-page/interests-persistent-header";
import { InterestsProgressDecoration } from "@/features/onboarding/components/interests/interests-page/interests-progress-decoration";
import { InterestsScreenRenderer } from "@/features/onboarding/components/interests/interests-page/interests-screen-renderer";
import { useInterestsPageFlow } from "@/features/onboarding/hooks/use-interests-page-flow";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";

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
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <aside className="relative hidden h-full flex-1 items-center justify-center overflow-hidden border-slate-muted/10 border-r bg-hero-bg lg:flex">
        <VoronoiCatalyst progress={progress} />
      </aside>

      <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-canvas">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="relative z-10 flex-1 overflow-x-hidden overflow-y-scroll scroll-smooth pb-0"
        >
          <InterestsProgressDecoration progress={progress} />
          <InterestsPersistentHeader
            state={state}
            scrollRef={scrollContainerRef}
          />

          <div className="flex min-h-full w-full flex-col items-center justify-start py-6 sm:py-0">
            <div className="relative w-full max-w-xl px-4 sm:px-5 lg:px-0">
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
