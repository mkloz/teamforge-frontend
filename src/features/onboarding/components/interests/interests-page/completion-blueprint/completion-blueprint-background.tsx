import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";

export function CompletionBlueprintBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 opacity-45">
        <VoronoiCatalyst progress={1} rotationDegrees={0} />
      </div>
      <div className="absolute inset-0 bg-hero-bg/62" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.16),transparent_44%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.28)_50%),linear-gradient(90deg,rgba(255,255,255,0.025),rgba(13,148,136,0.035),rgba(245,158,11,0.025))] bg-size-[100%_100%,100%_2px,3px_100%] pointer-events-none" />
    </div>
  );
}
