import { lazy, Suspense } from "react";
import { DecorativeVisualBoundary } from "@/shared/components/visuals/decorative-visual-boundary";
import { useVoronoiVisualEnabled } from "@/shared/hooks/use-voronoi-visual-enabled";
import type { VoronoiFormationTarget } from "@/shared/lib/voronoi/voronoi-contract";

const LazyVoronoiCatalyst = lazy(() =>
  import("@/shared/components/visuals/voronoi-catalyst").then((module) => ({
    default: module.VoronoiCatalyst,
  })),
);

const COMPLETION_FORMATION = {
  kind: "text",
  value: "TOGETHER",
} as const satisfies VoronoiFormationTarget;

export function CompletionBlueprintBackground() {
  const showVisual = useVoronoiVisualEnabled();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {showVisual ? (
        <DecorativeVisualBoundary>
          <Suspense fallback={null}>
            <div className="absolute inset-0 opacity-45">
              <LazyVoronoiCatalyst
                formation={COMPLETION_FORMATION}
                progress={1}
              />
            </div>
          </Suspense>
        </DecorativeVisualBoundary>
      ) : null}
      <div className="absolute inset-0 bg-hero-bg/62" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--color-brand-teal)_9%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-brand-teal)_9%,transparent)_1px,transparent_1px)] bg-size-[2rem_2rem]" />
    </div>
  );
}
