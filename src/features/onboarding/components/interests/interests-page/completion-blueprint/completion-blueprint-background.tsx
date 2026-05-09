import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";

export function CompletionBlueprintBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-45">
        <VoronoiCatalyst progress={1} rotationDegrees={0} />
      </div>
      <div className="absolute inset-0 bg-hero-bg/62" />
      <div className="completion-blueprint-scan completion-blueprint-scan-size pointer-events-none absolute inset-0" />
    </div>
  );
}
