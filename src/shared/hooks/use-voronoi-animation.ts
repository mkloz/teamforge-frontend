import { useCallback, useEffect, useRef, useState } from "react";
import { useEventListener } from "usehooks-ts";

import { NUM_SEEDS } from "@/shared/constants/voronoi.constants";
import { startVoronoiAnimationLoop } from "@/shared/hooks/voronoi-animation/animation-loop";
import { INITIAL_MOUSE_POSITION } from "@/shared/hooks/voronoi-animation/mouse";
import {
  createVoronoiPoint,
  getCenterPoint,
} from "@/shared/hooks/voronoi-animation/points";
import {
  getBrowserDevicePixelRatio,
  getBrowserMediaQuery,
} from "@/shared/lib/browser-environment";
import type {
  ScheduledAnimationFrameHandle,
  ScheduledDelayHandle,
} from "@/shared/lib/browser-scheduling";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";
import type {
  Dimensions,
  MouseState,
  Point,
} from "@/shared/lib/voronoi/voronoi-contract";

interface UseVoronoiOptions {
  progress: number;
  rotationDegrees?: number;
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
    const animationRefs = {
      currentMouseRef,
      currentProgressRef,
      dprRef,
      isTypingRef,
      mouseActiveRef,
      pointsRef,
      progressRef,
      requestRef,
      startTimeRef,
      targetMouseRef,
      timeRef,
      typingPulseRef,
    };

    return startVoronoiAnimationLoop({
      canvas: canvasRef.current,
      dimensions,
      refs: animationRefs,
      rotationDegrees,
    });
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
