import { useCallback, useEffect, useRef, useState } from "react";
import { useEventListener } from "usehooks-ts";

import { NUM_SEEDS } from "@/shared/constants/voronoi.constants";
import { startVoronoiAnimationLoop } from "@/shared/hooks/voronoi-animation/animation-loop";
import {
  getCanvasPointerPosition,
  INITIAL_MOUSE_POSITION,
} from "@/shared/hooks/voronoi-animation/mouse";
import {
  createVoronoiPoint,
  getCenterPoint,
  resizeVoronoiPoints,
} from "@/shared/hooks/voronoi-animation/points";
import {
  getBrowserComputedStyle,
  getBrowserDevicePixelRatio,
  getBrowserDocumentElement,
  getBrowserMediaQuery,
  getBrowserWindow,
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
  VoronoiFormationLayout,
  VoronoiFormationTarget,
} from "@/shared/lib/voronoi/voronoi-contract";
import {
  createVoronoiFormationLayout,
  getDefaultVoronoiFormation,
  getVoronoiFormationKey,
  getVoronoiFormationLayoutKey,
} from "@/shared/lib/voronoi/voronoi-formation";

interface UseVoronoiOptions {
  progress: number;
  formation?: VoronoiFormationTarget;
  rotationDegrees?: number;
}

export function useVoronoiAnimation({
  progress,
  formation = getDefaultVoronoiFormation(),
  rotationDegrees = -25,
}: UseVoronoiOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const requestRef = useRef<ScheduledAnimationFrameHandle | null>(null);
  const dprRef = useRef(1);
  const formationRef = useRef<VoronoiFormationLayout | null>(null);
  const previousDimensionsRef = useRef<Dimensions | null>(null);
  const isVisibleRef = useRef(true);
  const lastFrameTimeRef = useRef<number | null>(null);

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
  const [reducedMotion, setReducedMotion] = useState(false);
  const formationKey = getVoronoiFormationKey(formation);
  const formationLayoutKey = getVoronoiFormationLayoutKey(
    formation,
    rotationDegrees,
  );
  const formationTargetRef = useRef(formation);
  formationTargetRef.current = formation;
  const reducedMotionProgress = reducedMotion ? progress : null;

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

    const nextDimensions = {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    };
    setDimensions((currentDimensions) =>
      currentDimensions.width === nextDimensions.width &&
      currentDimensions.height === nextDimensions.height
        ? currentDimensions
        : nextDimensions,
    );
    dprRef.current = getBrowserDevicePixelRatio();
  }, []);

  useEventListener("resize", syncDimensions, undefined, { passive: true });

  // Handle container resizing and both OS and in-app reduced-effects settings.
  useEffect(() => {
    const motionQuery = getBrowserMediaQuery(
      "(prefers-reduced-motion: reduce)",
    );
    const documentElement = getBrowserDocumentElement();
    const browserWindow = getBrowserWindow();
    const syncReducedMotion = () => {
      setReducedMotion(
        (motionQuery?.matches ?? false) ||
          documentElement?.dataset.themeStyle === "glass",
      );
    };
    const motionListener = (e: MediaQueryListEvent) => {
      setReducedMotion(
        e.matches || documentElement?.dataset.themeStyle === "glass",
      );
    };
    const effectsObserver =
      documentElement && browserWindow?.MutationObserver
        ? new browserWindow.MutationObserver(syncReducedMotion)
        : null;
    const resizeObserver =
      containerRef.current && browserWindow?.ResizeObserver
        ? new browserWindow.ResizeObserver(syncDimensions)
        : null;

    syncDimensions();
    syncReducedMotion();
    motionQuery?.addEventListener("change", motionListener);
    if (documentElement) {
      effectsObserver?.observe(documentElement, {
        attributeFilter: ["data-theme-style"],
        attributes: true,
      });
    }
    if (containerRef.current) {
      resizeObserver?.observe(containerRef.current);
    }

    return () => {
      motionQuery?.removeEventListener("change", motionListener);
      effectsObserver?.disconnect();
      resizeObserver?.disconnect();
    };
  }, [syncDimensions]);

  useEffect(() => {
    const container = containerRef.current;
    const browserWindow = getBrowserWindow();
    if (!container || !browserWindow?.IntersectionObserver) return undefined;

    const observer = new browserWindow.IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry?.isIntersecting ?? true;
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

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

    const previousDimensions = previousDimensionsRef.current;
    if (pointsRef.current.length === 0) {
      pointsRef.current = Array.from({ length: NUM_SEEDS }).map((_, index) =>
        createVoronoiPoint(index, dimensions),
      );
    } else if (previousDimensions) {
      resizeVoronoiPoints(pointsRef.current, previousDimensions, dimensions);
    }

    const target = formationTargetRef.current;
    if (getVoronoiFormationKey(target) !== formationKey) {
      return undefined;
    }

    formationRef.current = createVoronoiFormationLayout({
      dimensions,
      points: pointsRef.current,
      rotationDegrees,
      target,
    });
    previousDimensionsRef.current = dimensions;

    return undefined;
  }, [dimensions, formationKey, rotationDegrees]);

  // Main Animation Loop
  useEffect(() => {
    if (formationRef.current?.key !== formationLayoutKey) {
      return undefined;
    }
    if (reducedMotionProgress !== null) {
      progressRef.current = reducedMotionProgress;
    }

    const animationRefs = {
      currentMouseRef,
      currentProgressRef,
      dprRef,
      formationRef,
      isTypingRef,
      isVisibleRef,
      lastFrameTimeRef,
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
      reducedMotion,
      rotationDegrees,
    });
  }, [
    dimensions,
    formationLayoutKey,
    reducedMotion,
    reducedMotionProgress,
    rotationDegrees,
  ]);

  function handleMouseMove(clientX: number, clientY: number) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const point = { x: clientX - rect.left, y: clientY - rect.top };
    const canvas = canvasRef.current;
    targetMouseRef.current = canvas
      ? getCanvasPointerPosition({
          center: getCenterPoint(dimensions),
          point,
          transform: getBrowserComputedStyle(canvas)?.transform ?? "none",
        })
      : point;
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
