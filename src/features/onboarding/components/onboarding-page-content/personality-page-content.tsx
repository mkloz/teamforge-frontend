import type { ReactNode, RefObject } from "react";
import { OnboardingHomeLink } from "@/features/onboarding/components/onboarding-home-link";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { cn } from "@/shared/lib/utils";
import { OnboardingVisualPanel } from "./onboarding-visual-panel";

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

      <OnboardingVisualPanel progress={catalystProgress} side="right" />
    </div>
  );
}
