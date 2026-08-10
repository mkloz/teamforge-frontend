import { useImperativeHandle } from "react";
import { useVoronoiAnimation } from "@/shared/hooks/use-voronoi-animation";
import { cn } from "@/shared/lib/utils";
import type { VoronoiCatalystProps } from "@/shared/lib/voronoi/voronoi-contract";

/**
 * VoronoiCatalyst Component
 * Provides a high-performance, depth-layered Voronoi visualization
 * that reacts to authentication progress and user input.
 */
export function VoronoiCatalyst({
  className,
  formation,
  ref,
  progress = 0,
  rotationDegrees,
}: VoronoiCatalystProps) {
  const resolvedRotationDegrees =
    rotationDegrees ?? (formation?.kind === "text" ? 0 : -25);
  const {
    containerRef,
    canvasRef,
    canvasDevicePixelRatio,
    dimensions,
    handleMouseMove,
    handleMouseLeave,
    pulseTyping,
  } = useVoronoiAnimation({
    formation,
    progress,
    rotationDegrees: resolvedRotationDegrees,
  });

  useImperativeHandle(ref, () => ({ pulseTyping }), [pulseTyping]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "relative size-full overflow-hidden bg-transparent shadow-[inset_0_0_4rem_rgba(13,148,136,0.16)]",
        className,
      )}
      onMouseMove={(e) => handleMouseMove(e.clientX, e.clientY)}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        width={Math.round(dimensions.width * canvasDevicePixelRatio)}
        height={Math.round(dimensions.height * canvasDevicePixelRatio)}
        className="block min-h-full min-w-full"
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
      />
      <div className="pointer-events-none absolute inset-0 [background:linear-gradient(to_right,rgba(0,0,0,0.5)_0%,transparent_12%,transparent_90%,rgba(0,0,0,0.5)_100%),linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,transparent_12%,transparent_90%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
