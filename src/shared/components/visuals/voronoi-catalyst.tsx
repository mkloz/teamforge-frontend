import { useVoronoiAnimation } from "@/shared/hooks/use-voronoi-animation";
import { getBrowserDevicePixelRatio } from "@/shared/lib/browser-environment";
import type { VoronoiCatalystProps } from "@/shared/lib/voronoi/voronoi-contract";
import { useImperativeHandle } from "react";

/**
 * VoronoiCatalyst Component
 * Provides a high-performance, depth-layered Voronoi visualization
 * that reacts to authentication progress and user input.
 */
export function VoronoiCatalyst({
  ref,
  progress = 0,
  rotationDegrees,
}: VoronoiCatalystProps) {
  const {
    containerRef,
    canvasRef,
    dimensions,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    pulseTyping,
  } = useVoronoiAnimation({ progress, rotationDegrees });

  useImperativeHandle(ref, () => ({ pulseTyping }), [pulseTyping]);

  const dpr = getBrowserDevicePixelRatio();

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-transparent shadow-[inset_0_0_120px_rgba(0,0,0,0.2)]"
      onMouseMove={(e) => handleMouseMove(e.clientX, e.clientY)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        className="block min-h-full min-w-full transition-opacity duration-1000 will-change-transform"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          // Initial transform; the actual transform is managed by the animation loop
          transform: "scale(1.25)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
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
