import { type ReactNode, type RefObject, useRef } from "react";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { useKeyboardSafeViewport } from "@/shared/hooks/use-keyboard-safe-viewport";
import type { VoronoiFormationTarget } from "@/shared/lib/voronoi/voronoi-contract";
import { OnboardingVisualPanel } from "./onboarding-visual-panel";

interface InterestsPageContentProps {
  children: ReactNode;
  completion?: ReactNode;
  footer: ReactNode;
  header: ReactNode;
  progress: number;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

const INTERESTS_FORMATION = {
  kind: "text",
  value: "YOUR FEW",
} as const satisfies VoronoiFormationTarget;

export function InterestsPageContent({
  children,
  completion,
  footer,
  header,
  progress,
  scrollContainerRef,
}: InterestsPageContentProps) {
  const viewportShellRef = useRef<HTMLDivElement>(null);
  useKeyboardSafeViewport(viewportShellRef);

  return (
    <div
      ref={viewportShellRef}
      className="keyboard-viewport-shell relative flex w-full flex-col overflow-hidden lg:flex-row"
    >
      <OnboardingVisualPanel
        asAside
        formation={INTERESTS_FORMATION}
        progress={progress}
        side="left"
      />

      <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-canvas">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="relative z-10 flex-1 overflow-x-hidden overflow-y-scroll pb-0"
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
