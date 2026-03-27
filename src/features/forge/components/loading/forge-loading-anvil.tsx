"use client";

/**
 * Concept A — "The Anvil Strike"
 * Forge-themed infinite loading animation.
 * A hammer swings down onto an anvil, sparks scatter outward on impact.
 * Runs forever until the parent unmounts it — no progress prop needed.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

interface ForgeLoadingAnvilProps {
  label?: string;
  className?: string;
}

export function ForgeLoadingAnvil({
  label = "Forging your group...",
  className,
}: ForgeLoadingAnvilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const frameRef = useRef<number>(0);
  const [hammerPhase, setHammerPhase] = useState<"up" | "strike" | "rebound">("up");

  // Hammer animation cycle — loops forever
  useEffect(() => {
    const cycle = () => {
      setHammerPhase("strike");
      setTimeout(() => {
        const newSparks: Spark[] = Array.from({ length: 18 }, (_, i) => ({
          id: Date.now() + i,
          x: 0,
          y: 0,
          vx: (Math.random() - 0.5) * 5.5,
          vy: -(Math.random() * 4 + 1.5),
          life: 1,
          size: Math.random() * 3 + 1,
          color: Math.random() > 0.4 ? "#f59e0b" : "#fbbf24",
        }));
        sparksRef.current = [...sparksRef.current, ...newSparks].slice(-60);
        setHammerPhase("rebound");
        setTimeout(() => setHammerPhase("up"), 180);
      }, 160);
    };

    const interval = setInterval(cycle, 1400);
    return () => clearInterval(interval);
  }, []);

  // Canvas spark physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2 + 8;

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      sparksRef.current = sparksRef.current
        .map((s) => ({
          ...s,
          x: s.x + s.vx,
          y: s.y + s.vy,
          vy: s.vy + 0.18,
          vx: s.vx * 0.97,
          life: s.life - 0.028,
        }))
        .filter((s) => s.life > 0);

      sparksRef.current.forEach((s) => {
        ctx.save();
        ctx.globalAlpha = s.life * 0.9;
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(cx + s.x, cy + s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const hammerRotation =
    hammerPhase === "up" ? -38 : hammerPhase === "strike" ? 12 : -8;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 select-none", className)}>
      {/* Animation stage */}
      <div className="relative w-52 h-52 flex items-center justify-center">
        {/* Spark canvas — widened for more travel room */}
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Forge glow backdrop */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-20 h-6 rounded-full bg-amber-500/20 blur-xl" />

        {/* Hammer SVG */}
        <div
          className="absolute"
          style={{
            top: "18px",
            left: "50%",
            transformOrigin: "bottom center",
            transform: `translateX(-60%) rotate(${hammerRotation}deg)`,
            transition: "transform 0.14s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <svg width="36" height="62" viewBox="0 0 36 62" fill="none">
            {/* Handle */}
            <rect x="15" y="24" width="6" height="38" rx="3" fill="#78350f" />
            {/* Head */}
            <rect x="4" y="10" width="28" height="18" rx="4" fill="#374151" />
            <rect x="4" y="10" width="28" height="6" rx="3" fill="#4b5563" />
          </svg>
        </div>

        {/* Anvil SVG */}
        <div className="absolute" style={{ bottom: "28px" }}>
          <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
            <rect x="8" y="0" width="40" height="18" rx="4" fill="#374151" />
            <rect x="8" y="0" width="40" height="5" rx="3" fill="#4b5563" />
            <rect x="14" y="18" width="28" height="8" rx="2" fill="#1f2937" />
            <rect x="18" y="26" width="20" height="8" rx="2" fill="#111827" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">This may take a moment...</p>
      </div>
    </div>
  );
}
