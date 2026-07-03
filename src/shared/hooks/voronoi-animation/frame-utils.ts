import { NUM_CORE, NUM_GUARD } from "@/shared/constants/voronoi.constants";
import type { MouseState, Point } from "@/shared/lib/voronoi/voronoi-contract";
import { drawCatalystCore } from "@/shared/lib/voronoi/voronoi-renderer";

export function writeDepthAdjustedPoints(
  flatPoints: Float64Array,
  points: Point[],
  parallaxOffset: MouseState,
) {
  for (let index = 0; index < points.length; index++) {
    const depth =
      index < NUM_CORE ? 1.0 : index < NUM_CORE + NUM_GUARD ? 0.6 : 0.3;
    flatPoints[index * 2] = points[index].x + parallaxOffset.x * depth;
    flatPoints[index * 2 + 1] = points[index].y + parallaxOffset.y * depth;
  }
}

export function getNextProgress(
  currentProgress: number,
  targetProgress: number,
) {
  return currentProgress + (targetProgress - currentProgress) * 0.012;
}

export function clampProgress(progress: number) {
  return Math.max(0, Math.min(1, progress));
}

export function getTypingPulseTarget(
  isTyping: boolean,
  currentProgress: number,
) {
  return isTyping && currentProgress < 1 ? 1 : 0;
}

export function getNextTypingPulse({
  currentPulse,
  isTyping,
  targetPulse,
}: {
  currentPulse: number;
  isTyping: boolean;
  targetPulse: number;
}) {
  return currentPulse + (targetPulse - currentPulse) * (isTyping ? 0.05 : 0.02);
}

export function drawCatalystCoreIfActive({
  ctx,
  coreAvg,
  parallaxOffset,
  sparkPhase,
}: {
  ctx: CanvasRenderingContext2D;
  coreAvg: MouseState;
  parallaxOffset: MouseState;
  sparkPhase: number;
}) {
  if (sparkPhase <= 0.01) {
    return;
  }

  drawCatalystCore(
    ctx,
    coreAvg.x + parallaxOffset.x,
    coreAvg.y + parallaxOffset.y,
    sparkPhase,
    sparkPhase * 0.9,
  );
}
