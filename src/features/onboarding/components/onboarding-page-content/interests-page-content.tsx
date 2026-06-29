import type { ReactNode, RefObject } from "react";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { OnboardingVisualPanel } from "./onboarding-visual-panel";

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
      <OnboardingVisualPanel asAside progress={progress} side="left" />

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
