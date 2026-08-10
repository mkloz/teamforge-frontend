import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";
import type { VoronoiFormationTarget } from "@/shared/lib/voronoi/voronoi-contract";

const COMPLETION_FORMATION = {
  kind: "text",
  value: "TOGETHER",
} as const satisfies VoronoiFormationTarget;

export function CompletionBlueprintBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-45">
        <VoronoiCatalyst formation={COMPLETION_FORMATION} progress={1} />
      </div>
      <div className="absolute inset-0 bg-hero-bg/62" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--color-brand-teal)_9%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-brand-teal)_9%,transparent)_1px,transparent_1px)] bg-size-[2rem_2rem]" />
    </div>
  );
}
