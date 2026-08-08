import type { ReactNode, RefObject } from "react";
import { OnboardingHomeLink } from "@/features/onboarding/components/onboarding-home-link";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import type {
  VoronoiCatalystHandle,
  VoronoiFormationTarget,
} from "@/shared/lib/voronoi/voronoi-contract";
import { OnboardingVisualPanel } from "./onboarding-visual-panel";

interface ProfileBasicsPageContentProps {
  catalystRef?: RefObject<VoronoiCatalystHandle | null>;
  children: ReactNode;
  formation?: VoronoiFormationTarget;
  onInput?: () => void;
  progress: number;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export function ProfileBasicsPageContent({
  catalystRef,
  children,
  formation,
  onInput,
  progress,
  scrollContainerRef,
}: ProfileBasicsPageContentProps) {
  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <OnboardingVisualPanel
        catalystRef={catalystRef}
        formation={formation}
        progress={progress}
        side="left"
      />

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <BackgroundTexture />
        <OnboardingHomeLink />

        <div
          ref={scrollContainerRef}
          className="relative h-full flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-4 pb-4"
          onInput={onInput}
        >
          <TopProgressBar
            progress={progress}
            className="sticky top-0 z-50 -mx-4 -mt-2 w-full"
          />

          <main className="relative z-10 flex min-h-full items-start justify-center pt-20 pb-10 lg:items-center lg:py-8">
            <div className="w-full max-w-sm px-2 sm:px-10 lg:p-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
