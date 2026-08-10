import { Delaunay } from "d3-delaunay";
import { NUM_SEEDS } from "@/shared/constants/voronoi.constants";
import {
  cancelScheduledAnimationFrame,
  scheduleAnimationFrame,
} from "@/shared/lib/browser-scheduling";
import type { Dimensions } from "@/shared/lib/voronoi/voronoi-contract";
import { updateParticlePhysics } from "@/shared/lib/voronoi/voronoi-physics";
import { drawParticleCells } from "@/shared/lib/voronoi/voronoi-renderer";
import {
  getAnimationCanvasTarget,
  getVoronoiBounds,
  prepareCanvasFrame,
  setCanvasFrameTransform,
} from "./canvas-frame";
import {
  clampProgress,
  drawCatalystCoreIfActive,
  getNextProgress,
  getNextTypingPulse,
  getTypingPulseTarget,
  writeDepthAdjustedPoints,
} from "./frame-utils";
import {
  getActiveMouseTarget,
  getParallaxOffset,
  lerpMousePosition,
} from "./mouse";
import { getCenterPoint } from "./points";
import type { VoronoiAnimationRefs } from "./types";

export function startVoronoiAnimationLoop({
  canvas,
  dimensions,
  refs,
  reducedMotion,
  rotationDegrees,
}: {
  canvas: HTMLCanvasElement | null;
  dimensions: Dimensions;
  refs: VoronoiAnimationRefs;
  reducedMotion: boolean;
  rotationDegrees: number;
}) {
  const animationTarget = getAnimationCanvasTarget(canvas, dimensions);

  if (!animationTarget) {
    return undefined;
  }

  const { canvas: targetCanvas, ctx } = animationTarget;
  const flatPoints = new Float64Array(NUM_SEEDS * 2);
  const bounds = getVoronoiBounds(dimensions);

  const animate = (timestamp: number) => {
    if (!refs.isVisibleRef.current) {
      refs.lastFrameTimeRef.current = null;
      refs.requestRef.current = scheduleAnimationFrame(animate);
      return;
    }

    const previousTimestamp = refs.lastFrameTimeRef.current ?? timestamp;
    const deltaSeconds = Math.min(
      1 / 20,
      Math.max(1 / 240, (timestamp - previousTimestamp) / 1000),
    );
    const frameScale = deltaSeconds * 60;
    refs.lastFrameTimeRef.current = timestamp;
    refs.timeRef.current += deltaSeconds * 0.6;
    const time = refs.timeRef.current;
    const dpr = refs.dprRef.current;
    const center = getCenterPoint(dimensions);
    const formation = refs.formationRef.current;
    const points = refs.pointsRef.current;

    if (!formation || points.length === 0) {
      refs.requestRef.current = scheduleAnimationFrame(animate);
      return;
    }

    prepareCanvasFrame({
      ctx,
      dimensions,
      dpr,
      reducedMotion,
      startTime: refs.startTimeRef.current,
    });

    refs.currentProgressRef.current = reducedMotion
      ? refs.progressRef.current
      : getNextProgress(
          refs.currentProgressRef.current,
          refs.progressRef.current,
          deltaSeconds,
        );
    const currentProgress = clampProgress(refs.currentProgressRef.current);

    refs.typingPulseRef.current = getNextTypingPulse({
      currentPulse: refs.typingPulseRef.current,
      deltaSeconds,
      isTyping: refs.isTypingRef.current,
      targetPulse: getTypingPulseTarget(
        refs.isTypingRef.current,
        currentProgress,
      ),
    });

    lerpMousePosition(
      refs.currentMouseRef.current,
      getActiveMouseTarget({
        center,
        mouseActive: refs.mouseActiveRef.current,
        targetMouse: refs.targetMouseRef.current,
      }),
      deltaSeconds,
    );

    const canvasMouse = refs.currentMouseRef.current;
    const parallaxOffset = getParallaxOffset(
      refs.currentMouseRef.current,
      center,
    );

    const { formationCenter, particlePhase } = updateParticlePhysics({
      points,
      time,
      currentProgress,
      isTyping: refs.isTypingRef.current,
      dimensions,
      formation,
      frameScale,
      mouseX: canvasMouse.x,
      mouseY: canvasMouse.y,
      mouseActive: refs.mouseActiveRef.current,
      settleInstantly: reducedMotion,
    });

    writeDepthAdjustedPoints(flatPoints, points, parallaxOffset);

    const voronoi = new Delaunay(flatPoints).voronoi(bounds);

    drawParticleCells(
      ctx,
      points,
      flatPoints,
      voronoi,
      canvasMouse.x,
      canvasMouse.y,
      refs.typingPulseRef.current,
      refs.mouseActiveRef.current,
      formation,
      currentProgress,
    );

    drawCatalystCoreIfActive({
      ctx,
      coreAvg: formationCenter,
      parallaxOffset,
      particleEnabled: formation.particleEnabled,
      particlePhase,
    });

    setCanvasFrameTransform(targetCanvas, rotationDegrees);

    ctx.restore();
    refs.requestRef.current = reducedMotion
      ? null
      : scheduleAnimationFrame(animate);
  };

  refs.requestRef.current = scheduleAnimationFrame(animate);

  return () => {
    if (refs.requestRef.current) {
      cancelScheduledAnimationFrame(refs.requestRef.current);
    }
  };
}
