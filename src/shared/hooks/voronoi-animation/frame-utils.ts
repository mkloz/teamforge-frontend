import {
  ANIMATION_CONFIG,
  NUM_FORMATION,
  NUM_GUARD,
} from "@/shared/constants/voronoi.constants";
import type { MouseState, Point } from "@/shared/lib/voronoi/voronoi-contract";
import { drawCatalystCore } from "@/shared/lib/voronoi/voronoi-renderer";

export function writeDepthAdjustedPoints(
  flatPoints: Float64Array,
  points: Point[],
  parallaxOffset: MouseState,
) {
  for (let index = 0; index < points.length; index++) {
    const depth =
      index < NUM_FORMATION
        ? 1.0
        : index < NUM_FORMATION + NUM_GUARD
          ? 0.6
          : 0.3;
    flatPoints[index * 2] = points[index].x + parallaxOffset.x * depth;
    flatPoints[index * 2 + 1] = points[index].y + parallaxOffset.y * depth;
  }
}

export function getNextProgress(
  currentProgress: number,
  targetProgress: number,
  deltaSeconds: number,
) {
  const response =
    1 - Math.exp(-ANIMATION_CONFIG.progressResponse * deltaSeconds);
  return currentProgress + (targetProgress - currentProgress) * response;
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
  deltaSeconds,
  isTyping,
  targetPulse,
}: {
  currentPulse: number;
  deltaSeconds: number;
  isTyping: boolean;
  targetPulse: number;
}) {
  const responseRate = isTyping
    ? ANIMATION_CONFIG.typingResponseIn
    : ANIMATION_CONFIG.typingResponseOut;
  const response = 1 - Math.exp(-responseRate * deltaSeconds);
  return currentPulse + (targetPulse - currentPulse) * response;
}

export function drawCatalystCoreIfActive({
  ctx,
  coreAvg,
  parallaxOffset,
  sparkEnabled,
  sparkPhase,
}: {
  ctx: CanvasRenderingContext2D;
  coreAvg: MouseState;
  parallaxOffset: MouseState;
  sparkEnabled: boolean;
  sparkPhase: number;
}) {
  if (!sparkEnabled || sparkPhase <= 0.01) {
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
