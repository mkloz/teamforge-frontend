import { Delaunay } from "d3-delaunay";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEventListener } from "usehooks-ts";

import {
  ANIMATION_CONFIG,
  GUARD_OFFSETS,
  NUM_CORE,
  NUM_GUARD,
  NUM_SEEDS,
} from "@/shared/constants/voronoi.constants";
import {
  getBrowserDevicePixelRatio,
  getBrowserMediaQuery,
} from "@/shared/lib/browser-environment";
import type {
  ScheduledAnimationFrameHandle,
  ScheduledDelayHandle,
} from "@/shared/lib/browser-scheduling";
import {
  cancelDelay,
  cancelScheduledAnimationFrame,
  scheduleAnimationFrame,
  scheduleDelay,
} from "@/shared/lib/browser-scheduling";
import type {
  Dimensions,
  MouseState,
  Point,
} from "@/shared/lib/voronoi/voronoi-contract";
import { updateParticlePhysics } from "@/shared/lib/voronoi/voronoi-physics";
import {
  drawCatalystCore,
  drawParticleCells,
} from "@/shared/lib/voronoi/voronoi-renderer";

interface UseVoronoiOptions {
  progress: number;
  rotationDegrees?: number;
}

// Pre-calculate constants outside the hook
const RAD = 25 * (Math.PI / 180);
const COS_RAD = Math.cos(RAD);
const SIN_RAD = Math.sin(RAD);
const INITIAL_MOUSE_POSITION = { x: -1000, y: -1000 } as const;

type VoronoiPointRole = "ambient" | "core" | "guard";

interface AnimationCanvasTarget {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

function getCenterPoint(dimensions: Dimensions) {
  return {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };
}

function createVoronoiPoint(index: number, dimensions: Dimensions): Point {
  const role = getVoronoiPointRole(index);
  const { x: startX, y: startY } = getVoronoiPointPosition({
    dimensions,
    index,
    role,
  });

  return {
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    targetX: startX,
    targetY: startY,
    opacity: getInitialVoronoiPointOpacity(role),
  };
}

function getVoronoiPointRole(index: number): VoronoiPointRole {
  if (index < NUM_CORE) {
    return "core";
  }

  if (index < NUM_CORE + NUM_GUARD) {
    return "guard";
  }

  return "ambient";
}

function getVoronoiPointPosition({
  dimensions,
  index,
  role,
}: {
  dimensions: Dimensions;
  index: number;
  role: VoronoiPointRole;
}) {
  if (role === "core") {
    return getCorePointStartPosition(index, dimensions);
  }

  if (role === "guard") {
    return getGuardPointStartPosition(index, dimensions);
  }

  return getRandomPointStartPosition(dimensions);
}

function getCorePointStartPosition(index: number, dimensions: Dimensions) {
  const spreadX = dimensions.width * 0.35;
  const spreadY = dimensions.height * 0.35;

  return {
    x: dimensions.width / 2 + getCoreColumnDirection(index) * spreadX,
    y: dimensions.height / 2 + getCoreRowDirection(index) * spreadY,
  };
}

function getCoreColumnDirection(index: number) {
  return index % 2 === 0 ? -1 : 1;
}

function getCoreRowDirection(index: number) {
  return Math.floor(index / 2) === 0 ? -1 : 1;
}

function getGuardPointStartPosition(index: number, dimensions: Dimensions) {
  const guardSize = Math.min(dimensions.width, dimensions.height) * 0.3;
  const guardOffset = GUARD_OFFSETS[index - NUM_CORE];

  return {
    x: dimensions.width / 2 + guardOffset.x * guardSize,
    y: dimensions.height / 2 + guardOffset.y * guardSize,
  };
}

function getRandomPointStartPosition(dimensions: Dimensions) {
  return {
    x: Math.random() * dimensions.width,
    y: Math.random() * dimensions.height,
  };
}

function getInitialVoronoiPointOpacity(role: VoronoiPointRole) {
  return role === "core"
    ? 0.2 + Math.random() * 0.3
    : 0.03 + Math.random() * 0.12;
}

function getRotatedMousePosition(targetMouse: MouseState, center: MouseState) {
  const targetDeltaX = targetMouse.x - center.x;
  const targetDeltaY = targetMouse.y - center.y;

  return {
    x: center.x + targetDeltaX * COS_RAD - targetDeltaY * SIN_RAD,
    y: center.y + targetDeltaX * SIN_RAD + targetDeltaY * COS_RAD,
  };
}

function lerpMousePosition(currentMouse: MouseState, activeTarget: MouseState) {
  currentMouse.x +=
    (activeTarget.x - currentMouse.x) * ANIMATION_CONFIG.lerpRate;
  currentMouse.y +=
    (activeTarget.y - currentMouse.y) * ANIMATION_CONFIG.lerpRate;
}

function getParallaxOffset(currentMouse: MouseState, center: MouseState) {
  return {
    x: (currentMouse.x - center.x) * ANIMATION_CONFIG.parallaxFactor,
    y: (currentMouse.y - center.y) * ANIMATION_CONFIG.parallaxFactor,
  };
}

function writeDepthAdjustedPoints(
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

function setCanvasFrameTransform(
  canvas: HTMLCanvasElement,
  currentMouse: MouseState,
  center: MouseState,
  rotationDegrees: number,
) {
  const frameX =
    (currentMouse.x - center.x) * ANIMATION_CONFIG.frameParallaxFactor;
  const frameY =
    (currentMouse.y - center.y) * ANIMATION_CONFIG.frameParallaxFactor;
  canvas.style.transform = `scale(1.25) rotate(${rotationDegrees}deg) translate(${frameX}px, ${frameY}px)`;
}

function getAnimationCanvasTarget(
  canvas: HTMLCanvasElement | null,
  dimensions: Dimensions,
): AnimationCanvasTarget | null {
  if (!hasDrawableDimensions(dimensions)) {
    return null;
  }

  return getCanvasContextTarget(canvas);
}

function hasDrawableDimensions(dimensions: Dimensions) {
  return dimensions.width !== 0 && dimensions.height !== 0;
}

function getCanvasContextTarget(
  canvas: HTMLCanvasElement | null,
): AnimationCanvasTarget | null {
  if (!canvas) {
    return null;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  return ctx ? { canvas, ctx } : null;
}

function getVoronoiBounds(
  dimensions: Dimensions,
): [number, number, number, number] {
  return [
    -dimensions.width * 0.5,
    -dimensions.height * 0.5,
    dimensions.width * 1.5,
    dimensions.height * 1.5,
  ];
}

function prepareCanvasFrame({
  ctx,
  dimensions,
  dpr,
  startTime,
}: {
  ctx: CanvasRenderingContext2D;
  dimensions: Dimensions;
  dpr: number;
  startTime: number;
}) {
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, dimensions.width, dimensions.height);
  ctx.globalAlpha = Math.min((Date.now() - startTime) / 1500, 1);
}

function getNextProgress(currentProgress: number, targetProgress: number) {
  return currentProgress + (targetProgress - currentProgress) * 0.012;
}

function clampProgress(progress: number) {
  return Math.max(0, Math.min(1, progress));
}

function getTypingPulseTarget(isTyping: boolean, currentProgress: number) {
  return isTyping && currentProgress < 1 ? 1 : 0;
}

function getNextTypingPulse({
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

function getActiveMouseTarget({
  center,
  mouseActive,
  targetMouse,
}: {
  center: MouseState;
  mouseActive: boolean;
  targetMouse: MouseState;
}) {
  return mouseActive ? targetMouse : center;
}

function drawCatalystCoreIfActive({
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

export function useVoronoiAnimation({
  progress,
  rotationDegrees = -25,
}: UseVoronoiOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const requestRef = useRef<ScheduledAnimationFrameHandle | null>(null);
  const dprRef = useRef(1);
  const prefersReducedMotionRef = useRef(false);

  // Animation State
  const currentProgressRef = useRef(0);
  const timeRef = useRef(0);
  const startTimeRef = useRef(0); // Set in useEffect
  const typingPulseRef = useRef(0);
  const typingTimerRef = useRef<ScheduledDelayHandle | null>(null);

  // Input State Refs
  const progressRef = useRef(progress);
  const isTypingRef = useRef(false);

  // Interaction Refs
  const targetMouseRef = useRef<MouseState>({ ...INITIAL_MOUSE_POSITION });
  const currentMouseRef = useRef<MouseState>({ ...INITIAL_MOUSE_POSITION });
  const mouseActiveRef = useRef(false);

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  // Sync props to refs
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const pulseTyping = useCallback(() => {
    isTypingRef.current = true;
    if (typingTimerRef.current !== null) {
      cancelDelay(typingTimerRef.current);
    }
    typingTimerRef.current = scheduleDelay(() => {
      isTypingRef.current = false;
      typingTimerRef.current = null;
    }, 800);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current !== null) {
        cancelDelay(typingTimerRef.current);
      }
    };
  }, []);

  // Set start time on mount to maintain purity
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const syncDimensions = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    setDimensions({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });
    dprRef.current = getBrowserDevicePixelRatio();
  }, []);

  useEventListener("resize", syncDimensions, undefined, { passive: true });

  // Handle Container Resizing and Environment Monitoring
  useEffect(() => {
    const motionQuery = getBrowserMediaQuery(
      "(prefers-reduced-motion: reduce)",
    );
    prefersReducedMotionRef.current = motionQuery?.matches ?? false;
    const motionListener = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };

    syncDimensions();
    motionQuery?.addEventListener("change", motionListener);

    return () => {
      motionQuery?.removeEventListener("change", motionListener);
    };
  }, [syncDimensions]);

  // Initialize Mouse Targets
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      const center = getCenterPoint(dimensions);
      targetMouseRef.current = center;
      currentMouseRef.current = center;
    }
  }, [dimensions]);

  // Point Generation
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return undefined;
    }

    pointsRef.current = Array.from({ length: NUM_SEEDS }).map((_, index) =>
      createVoronoiPoint(index, dimensions),
    );

    return undefined;
  }, [dimensions]);

  // Main Animation Loop
  useEffect(() => {
    const animationTarget = getAnimationCanvasTarget(
      canvasRef.current,
      dimensions,
    );

    if (!animationTarget) {
      return undefined;
    }

    const { canvas, ctx } = animationTarget;
    const flatPoints = new Float64Array(NUM_SEEDS * 2);
    const bounds = getVoronoiBounds(dimensions);

    const animate = () => {
      timeRef.current += 0.01;
      const time = timeRef.current;
      const dpr = dprRef.current;
      const center = getCenterPoint(dimensions);

      prepareCanvasFrame({
        ctx,
        dimensions,
        dpr,
        startTime: startTimeRef.current,
      });

      const points = pointsRef.current;
      if (points.length === 0) {
        ctx.restore();
        return;
      }

      // Smooth Prop Values
      currentProgressRef.current = getNextProgress(
        currentProgressRef.current,
        progressRef.current,
      );
      const currentProgress = clampProgress(currentProgressRef.current);

      typingPulseRef.current = getNextTypingPulse({
        currentPulse: typingPulseRef.current,
        isTyping: isTypingRef.current,
        targetPulse: getTypingPulseTarget(isTypingRef.current, currentProgress),
      });

      // Interaction Lerping
      lerpMousePosition(
        currentMouseRef.current,
        getActiveMouseTarget({
          center,
          mouseActive: mouseActiveRef.current,
          targetMouse: targetMouseRef.current,
        }),
      );

      // GLOW & PHYSICS (Reactive/Instant)
      // We use targetMouseRef here so the highlight and repulsion are perfectly synced with the cursor
      const canvasMouse = getRotatedMousePosition(
        targetMouseRef.current,
        center,
      );

      // PARALLAX & DRIFT (Smooth/Slow)
      // We use currentMouseRef here to keep the layer movement fluid and graceful
      const parallaxOffset = getParallaxOffset(currentMouseRef.current, center);

      // PHYSICS UPDATE
      const { coreAvg, sparkPhase } = updateParticlePhysics({
        points,
        time,
        currentProgress,
        isTyping: isTypingRef.current,
        dimensions,
        mouseX: canvasMouse.x,
        mouseY: canvasMouse.y,
        mouseActive: mouseActiveRef.current,
      });

      // RENDER DEPTH calculation
      writeDepthAdjustedPoints(flatPoints, points, parallaxOffset);

      // VORONOI GENERATION (O(n log n))
      const voronoi = new Delaunay(flatPoints).voronoi(bounds);

      // DRAWING CALLS
      drawParticleCells(
        ctx,
        points,
        flatPoints,
        voronoi,
        canvasMouse.x,
        canvasMouse.y,
        typingPulseRef.current,
        mouseActiveRef.current,
      );

      drawCatalystCoreIfActive({
        ctx,
        coreAvg,
        parallaxOffset,
        sparkPhase,
      });

      // FRAME CSS TRANSFORM (Hardware accelerated via will-change applied in JSX)
      setCanvasFrameTransform(
        canvas,
        currentMouseRef.current,
        center,
        rotationDegrees,
      );

      ctx.restore();
      requestRef.current = scheduleAnimationFrame(animate);
    };

    requestRef.current = scheduleAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelScheduledAnimationFrame(requestRef.current);
      }
    };
  }, [dimensions, rotationDegrees]);

  function handleMouseMove(clientX: number, clientY: number) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetMouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    mouseActiveRef.current = true;
  }

  function handleMouseLeave() {
    mouseActiveRef.current = false;
    // We do NOT reset targetMouse here. Instead, let the animate loop
    // handle the fallback to center while mouseActive is false.
    // This prevents the glow from 'snapping' back to center while fading.
  }

  return {
    containerRef,
    canvasRef,
    dimensions,
    handleMouseMove,
    handleMouseLeave,
    pulseTyping,
  };
}
