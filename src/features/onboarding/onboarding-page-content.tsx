import type { ReactNode, RefObject } from "react";
import { OnboardingHomeLink } from "@/features/onboarding/components/onboarding-home-link";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";
import { voronoiSplitDividerClassName } from "@/shared/components/visuals/voronoi-split-divider";
import { cn } from "@/shared/lib/utils";
import type { VoronoiCatalystHandle } from "@/shared/lib/voronoi/voronoi-contract";

interface ProfileBasicsPageContentProps {
  catalystRef?: RefObject<VoronoiCatalystHandle | null>;
  children: ReactNode;
  onInput?: () => void;
  progress: number;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export function ProfileBasicsPageContent({
  catalystRef,
  children,
  onInput,
  progress,
  scrollContainerRef,
}: ProfileBasicsPageContentProps) {
  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <div
        className={cn(
          "relative hidden h-full flex-1 items-center justify-center overflow-hidden border-r bg-hero-bg lg:flex",
          voronoiSplitDividerClassName,
        )}
      >
        <VoronoiCatalyst ref={catalystRef} progress={progress} />
      </div>

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

interface PersonalityPageContentProps {
  catalystProgress: number;
  children: ReactNode;
  displayProgress: number;
  hasTopPadding: boolean;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
  showHomeLink: boolean;
}

export function PersonalityPageContent({
  catalystProgress,
  children,
  displayProgress,
  hasTopPadding,
  scrollContainerRef,
  showHomeLink,
}: PersonalityPageContentProps) {
  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <BackgroundTexture />
        {showHomeLink ? <OnboardingHomeLink /> : null}

        <div
          ref={scrollContainerRef}
          className="relative h-full flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          <div className="absolute top-0 right-0 left-0 z-50">
            <TopProgressBar progress={displayProgress} />
          </div>

          <div
            className={cn(
              "relative flex min-h-full flex-col items-center justify-start px-4 pb-4 sm:px-6",
              hasTopPadding ? "pt-7 sm:pt-12" : "pt-4",
            )}
          >
            <div className="relative flex w-full max-w-xl flex-1 flex-col">
              {children}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "hidden h-full flex-1 items-center justify-center overflow-hidden border-l bg-hero-bg lg:flex",
          voronoiSplitDividerClassName,
        )}
      >
        <VoronoiCatalyst progress={catalystProgress} />
      </div>
    </div>
  );
}

interface InterestsPageContentProps {
  children: ReactNode;
  completion?: ReactNode;
  footer: ReactNode;
  header: ReactNode;
  progress: number;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export function InterestsPageContent({
  children,
  completion,
  footer,
  header,
  progress,
  scrollContainerRef,
}: InterestsPageContentProps) {
  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <aside
        className={cn(
          "relative hidden h-full flex-1 items-center justify-center overflow-hidden border-r bg-hero-bg lg:flex",
          voronoiSplitDividerClassName,
        )}
      >
        <VoronoiCatalyst progress={progress} />
      </aside>

      <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-canvas">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="relative z-10 flex-1 overflow-x-hidden overflow-y-scroll scroll-smooth pb-0"
        >
          {header}

          <div className="flex min-h-full w-full flex-col items-center justify-start py-6 sm:py-0">
            <div className="relative w-full max-w-xl px-4 sm:px-5 lg:px-0">
              <div className="relative w-full">{children}</div>
            </div>
          </div>
        </div>

        {footer}
      </main>

      {completion}
    </div>
  );
}
