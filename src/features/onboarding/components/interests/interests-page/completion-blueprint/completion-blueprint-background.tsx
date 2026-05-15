import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";

export function CompletionBlueprintBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-45">
        <VoronoiCatalyst progress={1} rotationDegrees={0} />
      </div>
      <div className="absolute inset-0 bg-hero-bg/62" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--color-forge-teal)_9%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-forge-teal)_9%,transparent)_1px,transparent_1px)] bg-size-[2rem_2rem]" />
    </div>
  );
}
