import { lazy, type RefObject, Suspense } from "react";
import { useDesktopOnboardingVisualEnabled } from "@/features/onboarding/hooks/use-desktop-onboarding-visual-enabled";
import { voronoiSplitDividerClassName } from "@/shared/components/visuals/voronoi-split-divider";
import { cn } from "@/shared/lib/utils";
import type {
  VoronoiCatalystHandle,
  VoronoiFormationTarget,
} from "@/shared/lib/voronoi/voronoi-contract";

const VoronoiCatalyst = lazy(() =>
  import("@/shared/components/visuals/voronoi-catalyst").then((module) => ({
    default: module.VoronoiCatalyst,
  })),
);

interface OnboardingVisualPanelProps {
  catalystRef?: RefObject<VoronoiCatalystHandle | null>;
  formation?: VoronoiFormationTarget;
  progress: number;
  side: "left" | "right";
  asAside?: boolean;
}

export function OnboardingVisualPanel({
  catalystRef,
  formation,
  progress,
  side,
  asAside = false,
}: OnboardingVisualPanelProps) {
  const showVisual = useDesktopOnboardingVisualEnabled();
  const Panel = asAside ? "aside" : "div";

  return (
    <Panel
      className={cn(
        "relative hidden h-full flex-1 items-center justify-center overflow-hidden bg-hero-bg lg:flex",
        side === "left" ? "border-r" : "border-l",
        voronoiSplitDividerClassName,
      )}
    >
      {showVisual ? (
        <Suspense fallback={null}>
          <VoronoiCatalyst
            ref={catalystRef}
            formation={formation}
            progress={progress}
          />
        </Suspense>
      ) : null}
    </Panel>
  );
}
