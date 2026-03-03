import { Delaunay } from "d3-delaunay";
import { useEffect, useRef, useState } from "react";

const COLORS = {
  void: "#090909",
  forgeTeal: "#0D9488",
  sparkAmber: "#F59E0B",
};

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  opacity: number;
}

interface VoronoiCatalystProps {
  isTyping?: boolean;
  progress?: number;
  className?: string;
}

const GUARD_OFFSETS = [
  { x: -1.1, y: -1.1 },
  { x: 0, y: -0.6 },
  { x: 1.1, y: -1.1 },
  { x: -0.6, y: 0 },
  { x: 0.6, y: 0 },
  { x: -1.1, y: 1.1 },
  { x: 0, y: 0.6 },
  { x: 1.1, y: 1.1 },
];

const CORE_ANGLES = [
  -145 * (Math.PI / 180),
  -25 * (Math.PI / 180),
  55 * (Math.PI / 180),
  130 * (Math.PI / 180),
];

export function VoronoiCatalyst({
  isTyping = false,
  progress = 0,
  className = "",
}: VoronoiCatalystProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const targetMouseRef = useRef({ x: -1000, y: -1000 });
  const currentMouseRef = useRef({ x: -1000, y: -1000 });
  const startTimeRef = useRef<number>(0);
  const typingPulseRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const numSeeds = 36;
  const pointsRef = useRef<Point[]>([]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    pointsRef.current = Array.from({ length: numSeeds }).map((_, i) => {
      const isCore = i < 4;
      const isGuard = i >= 4 && i < 12;

      let startX = Math.random() * dimensions.width;
      let startY = Math.random() * dimensions.height;

      if (isCore) {
        if (i === 0) {
          startX = dimensions.width * 0.2;
          startY = dimensions.height * 0.2;
        } else if (i === 1) {
          startX = dimensions.width * 0.8;
          startY = dimensions.height * 0.2;
        } else if (i === 2) {
          startX = dimensions.width * 0.8;
          startY = dimensions.height * 0.8;
        } else if (i === 3) {
          startX = dimensions.width * 0.2;
          startY = dimensions.height * 0.8;
        }
      } else if (isGuard) {
        const guardSize =
          Math.min(dimensions.width, dimensions.height) * 0.45 * 0.75;
        startX = dimensions.width / 2 + GUARD_OFFSETS[i - 4].x * guardSize;
        startY = dimensions.height / 2 + GUARD_OFFSETS[i - 4].y * guardSize;
      }

      return {
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        targetX: startX,
        targetY: startY,
        opacity: isCore
          ? 0.3 + Math.random() * 0.4
          : 0.05 + Math.random() * 0.15,
      };
    });
  }, [dimensions.width, dimensions.height]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || !canvasRef.current)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pre-allocate coordinate array for Delaunay
    const flatPoints = new Float64Array(pointsRef.current.length * 2);

    const rad = 25 * (Math.PI / 180);
    const cosRad = Math.cos(rad);
    const sinRad = Math.sin(rad);

    const animate = () => {
      timeRef.current += 0.01;
      const time = timeRef.current;

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);

      // Create a slight motion trail blur effect instead of a hard clearing
      ctx.fillStyle = "rgba(9, 9, 9, 0.4)";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      const elapsed = Date.now() - startTimeRef.current;
      ctx.globalAlpha = Math.min(elapsed / 1500, 1);

      const points = pointsRef.current;
      if (points.length === 0) {
        ctx.restore();
        return;
      }

      const progressDelta = progress - currentProgressRef.current;
      currentProgressRef.current += progressDelta * 0.01;
      const currentProgress = Math.max(
        0,
        Math.min(1, currentProgressRef.current),
      );

      if (isTyping && currentProgress < 1) {
        typingPulseRef.current = Math.min(typingPulseRef.current + 0.05, 1);
      } else {
        typingPulseRef.current = Math.max(typingPulseRef.current - 0.02, 0);
      }
      const typingPulse = typingPulseRef.current;

      currentMouseRef.current.x +=
        (targetMouseRef.current.x - currentMouseRef.current.x) * 0.1;
      currentMouseRef.current.y +=
        (targetMouseRef.current.y - currentMouseRef.current.y) * 0.1;

      const canvasCenterX = dimensions.width / 2;
      const canvasCenterY = dimensions.height / 2;

      const mdx = currentMouseRef.current.x - canvasCenterX;
      const mdy = currentMouseRef.current.y - canvasCenterY;
      const canvasMouseX = canvasCenterX + mdx * cosRad - mdy * sinRad;
      const canvasMouseY = canvasCenterY + mdx * sinRad + mdy * cosRad;

      const driftRadius = (15 + 15 * (1 - currentProgress)) * 0.75;
      const driftingCenterX =
        canvasCenterX +
        Math.cos(time * 0.3) * driftRadius +
        Math.sin(time * 0.4) * (driftRadius * 0.5);
      const driftingCenterY =
        canvasCenterY -
        30 +
        Math.sin(time * 0.35) * driftRadius +
        Math.cos(time * 0.45) * (driftRadius * 0.5);

      let coreAvgX = 0;
      let coreAvgY = 0;

      const baseGuardSize =
        Math.min(dimensions.width, dimensions.height) *
        (0.44 - currentProgress * 0.15) *
        0.53;
      const guardSize = baseGuardSize + Math.sin(time * 0.4) * 3.5;
      const exclusionRadius =
        Math.min(dimensions.width, dimensions.height) *
        (0.35 + currentProgress * 0.15) *
        0.35;
      const easedProgress = 1 - (1 - currentProgress) * (1 - currentProgress);
      const sparkPhase =
        currentProgress > 0.85
          ? Math.min((currentProgress - 0.85) / 0.15, 1)
          : 0;
      const breathStrength = 1 - sparkPhase;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        if (i < 4) {
          let cornerX = canvasCenterX;
          let cornerY = canvasCenterY;
          // When currentProgress is 0, the particles rest at these offsets.
          // We don't want them entirely off-screen to avoid empty areas.
          const spreadX = canvasCenterX * 0.65;
          const spreadY = canvasCenterY * 0.65;

          if (i === 0) {
            cornerX = canvasCenterX - spreadX;
            cornerY = canvasCenterY - spreadY;
          } else if (i === 1) {
            cornerX = canvasCenterX + spreadX;
            cornerY = canvasCenterY - spreadY;
          } else if (i === 2) {
            cornerX = canvasCenterX + spreadX;
            cornerY = canvasCenterY + spreadY;
          } else if (i === 3) {
            cornerX = canvasCenterX - spreadX;
            cornerY = canvasCenterY + spreadY;
          }

          const R = 27;
          const angle = CORE_ANGLES[i] + Math.sin(time * 0.6 + i * 2.1) * 0.2;
          const finalX = driftingCenterX + Math.cos(angle) * R;
          const finalY = driftingCenterY + Math.sin(angle) * R;

          const targetX = cornerX + (finalX - cornerX) * easedProgress;
          const targetY = cornerY + (finalY - cornerY) * easedProgress;
          const pullStrength = 0.08 + easedProgress * 0.05;

          p.x += (targetX - p.x) * pullStrength;
          p.y += (targetY - p.y) * pullStrength;

          const speedMultiplier =
            (isTyping && currentProgress < 0.9 ? 1.5 : 0.2) * breathStrength;
          p.x += p.vx * speedMultiplier;
          p.y += p.vy * speedMultiplier;

          coreAvgX += p.x;
          coreAvgY += p.y;
        } else if (i >= 4 && i < 12) {
          // Add "Breathing" logic: Guard nodes organically drift in small orbits
          const breathX = Math.cos(time * 0.8 + i) * 10;
          const breathY = Math.sin(time * 0.6 + i) * 10;

          const targetX =
            driftingCenterX + GUARD_OFFSETS[i - 4].x * guardSize + breathX;
          const targetY =
            driftingCenterY + GUARD_OFFSETS[i - 4].y * guardSize + breathY;

          p.x += (targetX - p.x) * 0.15;
          p.y += (targetY - p.y) * 0.15;
          p.x += p.vx * 0.2;
          p.y += p.vy * 0.2;
        } else {
          p.targetX += p.vx * 0.5;
          p.targetY += p.vy * 0.5;

          const dx = p.targetX - driftingCenterX;
          const dy = p.targetY - driftingCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < exclusionRadius && dist > 0) {
            const pushOut =
              (exclusionRadius - dist) * 0.05 * Math.max(0.1, currentProgress);
            p.targetX += (dx / dist) * pushOut;
            p.targetY += (dy / dist) * pushOut;
          }

          if (
            p.targetX < -dimensions.width * 0.2 ||
            p.targetX > dimensions.width * 1.2
          )
            p.vx *= -1;
          if (
            p.targetY < -dimensions.height * 0.2 ||
            p.targetY > dimensions.height * 1.2
          )
            p.vy *= -1;

          p.x += (p.targetX - p.x) * 0.05;
          p.y += (p.targetY - p.y) * 0.05;

          const mDistX = p.x - canvasMouseX;
          const mDistY = p.y - canvasMouseY;
          const mDist = Math.sqrt(mDistX * mDistX + mDistY * mDistY);

          // Handle Mouse Hover Repulsion
          if (mDist < 250 && mDist > 0) {
            // Apply a constant push force regardless of form fill progress
            const push = (250 - mDist) * 0.03;
            p.x += (mDistX / mDist) * push;
            p.y += (mDistY / mDist) * push;
          }

          // Random Drift
          if (Math.random() < 0.005) {
            p.vx = (Math.random() - 0.5) * 0.1;
            p.vy = (Math.random() - 0.5) * 0.1;
          }
        }

        flatPoints[i * 2] = p.x;
        flatPoints[i * 2 + 1] = p.y;
      }

      coreAvgX /= 4;
      coreAvgY /= 4;

      const delaunay = new Delaunay(flatPoints);
      const voronoi = delaunay.voronoi([
        -dimensions.width * 0.5,
        -dimensions.height * 0.5,
        dimensions.width * 1.5,
        dimensions.height * 1.5,
      ]);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const cell = voronoi.cellPolygon(i);
        if (!cell) continue;

        ctx.beginPath();
        for (let j = 0; j < cell.length; j++) {
          if (j === 0) ctx.moveTo(cell[j][0], cell[j][1]);
          else ctx.lineTo(cell[j][0], cell[j][1]);
        }
        ctx.closePath();

        const baseOpacity = p.opacity + typingPulse * 0.1;
        const hDistX = p.x - canvasMouseX;
        const hDistY = p.y - canvasMouseY;
        const hoverDist = Math.sqrt(hDistX * hDistX + hDistY * hDistY);

        if (hoverDist < 250 && targetMouseRef.current.x !== -1000) {
          const hoverIntensity = 1 - hoverDist / 250;
          const fillGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 180);
          fillGrad.addColorStop(
            0,
            `rgba(13, 148, 136, ${Math.min(1, baseOpacity + 0.3 * hoverIntensity)})`,
          );
          fillGrad.addColorStop(
            1,
            `rgba(13, 148, 136, ${Math.max(0, baseOpacity - 0.05)})`,
          );
          ctx.fillStyle = fillGrad;
        } else {
          ctx.fillStyle = `rgba(13, 148, 136, ${baseOpacity})`;
        }

        ctx.fill();

        ctx.strokeStyle = "rgba(13, 148, 136, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.strokeStyle = "rgba(13, 148, 136, 0.1)";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      if (sparkPhase > 0.01) {
        const timeNow = Date.now();
        const amberOpacity = sparkPhase * 0.9;
        const coreRadius =
          (8 * sparkPhase + Math.sin(timeNow / 150) * 1.5) * 0.75;

        const outerGlowRadius =
          60 * sparkPhase * (1 + Math.sin(timeNow / 800) * 0.1) * 0.75;
        ctx.beginPath();
        ctx.arc(coreAvgX, coreAvgY, outerGlowRadius, 0, Math.PI * 2);
        const outerGradient = ctx.createRadialGradient(
          coreAvgX,
          coreAvgY,
          0,
          coreAvgX,
          coreAvgY,
          outerGlowRadius,
        );
        outerGradient.addColorStop(
          0,
          `rgba(245, 158, 11, ${amberOpacity * 0.3})`,
        );
        outerGradient.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = outerGradient;
        ctx.fill();

        const innerGlowRadius =
          24 * sparkPhase * (1 + Math.sin(timeNow / 300) * 0.2) * 0.75;
        ctx.beginPath();
        ctx.arc(coreAvgX, coreAvgY, innerGlowRadius, 0, Math.PI * 2);
        const innerGradient = ctx.createRadialGradient(
          coreAvgX,
          coreAvgY,
          0,
          coreAvgX,
          coreAvgY,
          innerGlowRadius,
        );
        innerGradient.addColorStop(
          0,
          `rgba(245, 158, 11, ${amberOpacity * 0.8})`,
        );
        innerGradient.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = innerGradient;
        ctx.fill();

        const numRays = 8;
        ctx.save();
        ctx.translate(coreAvgX, coreAvgY);
        ctx.rotate(timeNow / 3000);
        for (let r = 0; r < numRays; r++) {
          const rayAngle = (r / numRays) * Math.PI * 2;
          const rayLength =
            (15 + Math.sin(timeNow / 200 + r) * 5) * sparkPhase * 0.75;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(
            Math.cos(rayAngle) * rayLength,
            Math.sin(rayAngle) * rayLength,
          );
          ctx.strokeStyle = `rgba(245, 158, 11, ${amberOpacity * 0.6})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();

        ctx.beginPath();
        ctx.arc(
          coreAvgX,
          coreAvgY,
          Math.max(0.1, coreRadius * 0.5),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "#FFFBEB";
        ctx.shadowColor = COLORS.sparkAmber;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // --- NEW: Expanding Energy Pulse Ring ---
        const pulseTime = (timeNow / 800) % 1;
        const pulseRadius = pulseTime * 120 * sparkPhase;
        const pulseOpacity = (1 - pulseTime) * amberOpacity * 0.4;
        ctx.beginPath();
        ctx.arc(coreAvgX, coreAvgY, Math.max(0.1, pulseRadius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 158, 11, ${pulseOpacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- NEW: Rotating Segmented Tech Ring ---
        ctx.save();
        ctx.translate(coreAvgX, coreAvgY);
        ctx.rotate(-timeNow / 4000); // Slow counter-clockwise
        ctx.beginPath();
        ctx.arc(0, 0, 40 * sparkPhase, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(13, 148, 136, ${amberOpacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]); // Dash pattern
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      ctx.restore();
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [dimensions.width, dimensions.height, progress, isTyping]);

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#090909] ${className}`}
      onMouseMove={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        targetMouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }}
      onMouseLeave={() => {
        targetMouseRef.current = { x: -1000, y: -1000 };
      }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        className="block min-w-full min-h-full"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          transform: "scale(1.25) rotate(-25deg)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, #090909 100%)",
          opacity: 0.6,
        }}
      />
    </div>
  );
}
