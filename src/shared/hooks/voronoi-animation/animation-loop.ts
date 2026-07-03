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
  getRotatedMousePosition,
  lerpMousePosition,
} from "./mouse";
import { getCenterPoint } from "./points";
import type { VoronoiAnimationRefs } from "./types";

export function startVoronoiAnimationLoop({
  canvas,
  dimensions,
  refs,
  rotationDegrees,
}: {
  canvas: HTMLCanvasElement | null;
  dimensions: Dimensions;
  refs: VoronoiAnimationRefs;
  rotationDegrees: number;
}) {
  const animationTarget = getAnimationCanvasTarget(canvas, dimensions);

  if (!animationTarget) {
    return undefined;
  }

  const { canvas: targetCanvas, ctx } = animationTarget;
  const flatPoints = new Float64Array(NUM_SEEDS * 2);
  const bounds = getVoronoiBounds(dimensions);

  const animate = () => {
    refs.timeRef.current += 0.01;
    const time = refs.timeRef.current;
    const dpr = refs.dprRef.current;
    const center = getCenterPoint(dimensions);

    prepareCanvasFrame({
      ctx,
      dimensions,
      dpr,
      startTime: refs.startTimeRef.current,
    });

    const points = refs.pointsRef.current;
    if (points.length === 0) {
      ctx.restore();
      return;
    }

    refs.currentProgressRef.current = getNextProgress(
      refs.currentProgressRef.current,
      refs.progressRef.current,
    );
    const currentProgress = clampProgress(refs.currentProgressRef.current);

    refs.typingPulseRef.current = getNextTypingPulse({
      currentPulse: refs.typingPulseRef.current,
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
    );

    const canvasMouse = getRotatedMousePosition(
      refs.targetMouseRef.current,
      center,
    );
    const parallaxOffset = getParallaxOffset(
      refs.currentMouseRef.current,
      center,
    );

    const { coreAvg, sparkPhase } = updateParticlePhysics({
      points,
      time,
      currentProgress,
      isTyping: refs.isTypingRef.current,
      dimensions,
      mouseX: canvasMouse.x,
      mouseY: canvasMouse.y,
      mouseActive: refs.mouseActiveRef.current,
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
    );

    drawCatalystCoreIfActive({
      ctx,
      coreAvg,
      parallaxOffset,
      sparkPhase,
    });

    setCanvasFrameTransform(
      targetCanvas,
      refs.currentMouseRef.current,
      center,
      rotationDegrees,
    );

    ctx.restore();
    refs.requestRef.current = scheduleAnimationFrame(animate);
  };

  refs.requestRef.current = scheduleAnimationFrame(animate);

  return () => {
    if (refs.requestRef.current) {
      cancelScheduledAnimationFrame(refs.requestRef.current);
    }
  };
}
