import { Delaunay } from "d3-delaunay";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ANIMATION_CONFIG,
  GUARD_OFFSETS,
  NUM_CORE,
  NUM_GUARD,
  NUM_SEEDS,
} from "../constants/voronoi.constants";
import { updateParticlePhysics } from "../lib/voronoi-physics";
import { drawCatalystCore, drawParticleCells } from "../lib/voronoi-renderer";
import type { Dimensions, MouseState, Point } from "../types/voronoi.types";

interface UseVoronoiOptions {
  progress: number;
  isTyping: boolean;
}

// Pre-calculate constants outside the hook
const RAD = 25 * (Math.PI / 180);
const COS_RAD = Math.cos(RAD);
const SIN_RAD = Math.sin(RAD);

export function useVoronoiAnimation({ progress, isTyping }: UseVoronoiOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const requestRef = useRef<number>(0);
  const dprRef = useRef(1);
  const prefersReducedMotionRef = useRef(false);

  // Animation State
  const currentProgressRef = useRef(0);
  const timeRef = useRef(0);
  const startTimeRef = useRef(0); // Set in useEffect
  const typingPulseRef = useRef(0);

  // Input State Refs
  const progressRef = useRef(progress);
  const isTypingRef = useRef(isTyping);

  // Interaction Refs
  const targetMouseRef = useRef<MouseState>({ x: -1000, y: -1000 });
  const currentMouseRef = useRef<MouseState>({ x: -1000, y: -1000 });
  const mouseActiveRef = useRef(false);

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  // Sync props to refs
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);
  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  // Set start time on mount to maintain purity
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  // Handle Container Resizing and Environment Monitoring
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
        dprRef.current = window.devicePixelRatio || 1;
      }
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = motionQuery.matches;
    const motionListener = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    motionQuery.addEventListener("change", motionListener);

    return () => {
      window.removeEventListener("resize", handleResize);
      motionQuery.removeEventListener("change", motionListener);
    };
  }, []);

  // Initialize Mouse Targets
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      const center = { x: dimensions.width / 2, y: dimensions.height / 2 };
      targetMouseRef.current = center;
      currentMouseRef.current = center;
    }
  }, [dimensions]);

  // Point Generation
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    pointsRef.current = Array.from({ length: NUM_SEEDS }).map((_, i) => {
      const isCore = i < NUM_CORE;
      const isGuard = i >= NUM_CORE && i < NUM_CORE + NUM_GUARD;

      let startX = Math.random() * dimensions.width;
      let startY = Math.random() * dimensions.height;

      if (isCore) {
        const spreadX = dimensions.width * 0.35;
        const spreadY = dimensions.height * 0.35;
        startX = dimensions.width / 2 + (i % 2 === 0 ? -spreadX : spreadX);
        startY =
          dimensions.height / 2 +
          (Math.floor(i / 2) === 0 ? -spreadY : spreadY);
      } else if (isGuard) {
        const guardSize = Math.min(dimensions.width, dimensions.height) * 0.3;
        startX =
          dimensions.width / 2 + GUARD_OFFSETS[i - NUM_CORE].x * guardSize;
        startY =
          dimensions.height / 2 + GUARD_OFFSETS[i - NUM_CORE].y * guardSize;
      }

      return {
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        targetX: startX,
        targetY: startY,
        opacity: isCore
          ? 0.2 + Math.random() * 0.3
          : 0.03 + Math.random() * 0.12,
      };
    });
  }, [dimensions]);

  // Main Animation Loop
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || !canvasRef.current)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const flatPoints = new Float64Array(NUM_SEEDS * 2);
    const bounds: [number, number, number, number] = [
      -dimensions.width * 0.5,
      -dimensions.height * 0.5,
      dimensions.width * 1.5,
      dimensions.height * 1.5,
    ];

    const animate = () => {
      // Reduced Motion Gate: Skip heavy physics/renders if requested
      if (prefersReducedMotionRef.current) {
        // Just show static or very slow settling if needed
        // For now, we continue but could theoretically jump to static end state
      }

      timeRef.current += 0.01;
      const time = timeRef.current;
      const dpr = dprRef.current;
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.globalAlpha = Math.min((Date.now() - startTimeRef.current) / 1500, 1);

      const points = pointsRef.current;
      if (points.length === 0) {
        ctx.restore();
        return;
      }

      // Smooth Prop Values
      currentProgressRef.current +=
        (progressRef.current - currentProgressRef.current) * 0.012;
      const currentProgress = Math.max(
        0,
        Math.min(1, currentProgressRef.current),
      );

      const typingTarget = isTypingRef.current && currentProgress < 1 ? 1 : 0;
      typingPulseRef.current +=
        (typingTarget - typingPulseRef.current) *
        (isTypingRef.current ? 0.05 : 0.02);

      // Interaction Lerping
      const activeTarget = mouseActiveRef.current
        ? targetMouseRef.current
        : { x: centerX, y: centerY };

      currentMouseRef.current.x +=
        (activeTarget.x - currentMouseRef.current.x) *
        ANIMATION_CONFIG.lerpRate;
      currentMouseRef.current.y +=
        (activeTarget.y - currentMouseRef.current.y) *
        ANIMATION_CONFIG.lerpRate;

      // GLOW & PHYSICS (Reactive/Instant)
      // We use targetMouseRef here so the highlight and repulsion are perfectly synced with the cursor
      const tdx = targetMouseRef.current.x - centerX;
      const tdy = targetMouseRef.current.y - centerY;

      const canvasMouseX = centerX + tdx * COS_RAD - tdy * SIN_RAD;
      const canvasMouseY = centerY + tdx * SIN_RAD + tdy * COS_RAD;

      // PARALLAX & DRIFT (Smooth/Slow)
      // We use currentMouseRef here to keep the layer movement fluid and graceful
      const mdx = currentMouseRef.current.x - centerX;
      const mdy = currentMouseRef.current.y - centerY;

      // PHYSICS UPDATE
      const { coreAvg, sparkPhase } = updateParticlePhysics({
        points,
        time,
        currentProgress,
        isTyping: isTypingRef.current,
        dimensions,
        mouseX: canvasMouseX,
        mouseY: canvasMouseY,
        mouseActive: mouseActiveRef.current,
      });

      // RENDER DEPTH calculation
      const fpx = mdx * ANIMATION_CONFIG.parallaxFactor;
      const fpy = mdy * ANIMATION_CONFIG.parallaxFactor;

      for (let i = 0; i < points.length; i++) {
        const depth = i < NUM_CORE ? 1.0 : i < NUM_CORE + NUM_GUARD ? 0.6 : 0.3;
        flatPoints[i * 2] = points[i].x + fpx * depth;
        flatPoints[i * 2 + 1] = points[i].y + fpy * depth;
      }

      // VORONOI GENERATION (O(n log n))
      const voronoi = new Delaunay(flatPoints).voronoi(bounds);

      // DRAWING CALLS
      drawParticleCells(
        ctx,
        points,
        flatPoints,
        voronoi,
        canvasMouseX,
        canvasMouseY,
        typingPulseRef.current,
        mouseActiveRef.current,
      );

      if (sparkPhase > 0.01) {
        drawCatalystCore(
          ctx,
          coreAvg.x + fpx,
          coreAvg.y + fpy,
          sparkPhase,
          sparkPhase * 0.9,
        );
      }

      // FRAME CSS TRANSFORM (Hardware accelerated via will-change applied in JSX)
      const frameX = mdx * ANIMATION_CONFIG.frameParallaxFactor;
      const frameY = mdy * ANIMATION_CONFIG.frameParallaxFactor;
      canvas.style.transform = `scale(1.25) rotate(-25deg) translate(${frameX}px, ${frameY}px)`;

      ctx.restore();
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [dimensions]);

  const handleMouseMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetMouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    mouseActiveRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseActiveRef.current = false;
    // We do NOT reset targetMouse here. Instead, let the animate loop
    // handle the fallback to center while mouseActive is false.
    // This prevents the glow from 'snapping' back to center while fading.
  }, []);

  const handleMouseEnter = useCallback(() => {
    // We wait for the first move event to snap the mouse position
  }, []);

  return {
    containerRef,
    canvasRef,
    dimensions,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  };
}
