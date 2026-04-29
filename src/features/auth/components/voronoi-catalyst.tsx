import { useVoronoiAnimation } from "../hooks/use-voronoi-animation";
import type { VoronoiCatalystProps } from "../lib/voronoi-contract";

/**
 * VoronoiCatalyst Component
 * Provides a high-performance, depth-layered Voronoi visualization
 * that reacts to authentication progress and user input.
 */
export function VoronoiCatalyst({
  progress = 0,
}: Omit<VoronoiCatalystProps, "isTyping">) {
  const {
    containerRef,
    canvasRef,
    dimensions,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = useVoronoiAnimation({ progress });

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-transparent shadow-[inset_0_0_120px_rgba(0,0,0,0.2)]"
      onMouseMove={(e) => handleMouseMove(e.clientX, e.clientY)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        className="block min-w-full min-h-full transition-opacity duration-1000 will-change-transform"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          // Initial transform; the actual transform is managed by the animation loop
          transform: "scale(1.25)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to right, rgba(0, 0, 0, 0.50) 0%, transparent 12%, transparent 90%, rgba(0, 0, 0, 0.50) 100%),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.50) 0%, transparent 12%, transparent 90%, rgba(0, 0, 0, 0.50) 100%)
          `,
        }}
      />
    </div>
  );
}
