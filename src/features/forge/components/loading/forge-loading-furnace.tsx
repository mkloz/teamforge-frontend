"use client";

/**
 * Concept B — "The Glowing Furnace"
 * Forge-themed. A furnace door pulses with molten amber light, ember particles
 * rise upward like heat shimmer, and a horizontal progress bar fills like
 * metal heating from cold iron to glowing steel.
 */

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";

interface ForgeLoadingFurnaceProps {
  progress?: number;
  label?: string;
  className?: string;
}

export function ForgeLoadingFurnace({
  progress = 0,
  label = "Heating the forge...",
  className,
}: ForgeLoadingFurnaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    type Ember = {
      x: number;
      y: number;
      vy: number;
      vx: number;
      size: number;
      life: number;
      color: string;
    };

    const embers: Ember[] = [];

    const spawnEmber = () => {
      embers.push({
        x: W / 2 + (Math.random() - 0.5) * 48,
        y: H * 0.62,
        vy: -(Math.random() * 1.4 + 0.6),
        vx: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2.5 + 0.8,
        life: 1,
        color: Math.random() > 0.5 ? "#f59e0b" : "#ef4444",
      });
    };

    let spawnTick = 0;
    const render = () => {
      ctx.clearRect(0, 0, W, H);

      spawnTick++;
      if (spawnTick % 3 === 0) spawnEmber();

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.life -= 0.012;
        if (e.life <= 0) { embers.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = e.life * 0.85;
        ctx.fillStyle = e.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * e.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // Color transitions: cold iron → orange glow → white hot based on progress
  const getBarColor = () => {
    if (progress < 30) return "#4b5563";
    if (progress < 60) return "#f97316";
    if (progress < 85) return "#f59e0b";
    return "#fbbf24";
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 select-none", className)}>
      {/* Furnace illustration */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Ember canvas */}
        <canvas
          ref={canvasRef}
          width={176}
          height={176}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Furnace body */}
        <div className="relative z-10">
          <svg width="96" height="100" viewBox="0 0 96 100" fill="none">
            {/* Body */}
            <rect x="4" y="20" width="88" height="72" rx="8" fill="#1f2937" />
            <rect x="4" y="20" width="88" height="12" rx="8" fill="#374151" />
            {/* Chimney */}
            <rect x="30" y="4" width="16" height="22" rx="4" fill="#111827" />
            <rect x="24" y="4" width="28" height="8" rx="4" fill="#374151" />
            {/* Door frame */}
            <rect x="22" y="40" width="52" height="42" rx="6" fill="#111827" />
            {/* Door glow — animated via CSS */}
            <rect
              x="26"
              y="44"
              width="44"
              height="34"
              rx="4"
              fill="#f59e0b"
              opacity="0.15"
              style={{ animation: "furnace-pulse 1.8s ease-in-out infinite" }}
            />
            {/* Inner fire */}
            <ellipse cx="48" cy="72" rx="16" ry="8" fill="#ef4444" opacity="0.6" />
            <ellipse cx="48" cy="68" rx="10" ry="10" fill="#f59e0b" opacity="0.7" />
            <ellipse cx="48" cy="64" rx="6" ry="7" fill="#fbbf24" opacity="0.9" />
          </svg>

          {/* Glow halo around door */}
          <div
            className="absolute rounded-lg pointer-events-none"
            style={{
              top: "40px",
              left: "22px",
              width: "52px",
              height: "42px",
              boxShadow: `0 0 ${12 + progress * 0.3}px ${progress * 0.25}px rgba(245,158,11,0.35)`,
              transition: "box-shadow 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Heat bar — fills like metal heating */}
      <div className="w-56 space-y-2">
        <div className="h-2 rounded-full bg-border/30 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: getBarColor(),
              boxShadow: progress > 50 ? `0 0 8px 1px ${getBarColor()}` : "none",
            }}
          />
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            {progress < 30 ? "Cold iron..." : progress < 65 ? "Heating up..." : progress < 90 ? "White hot..." : "Ready to forge..."}
          </p>
        </div>
      </div>
    </div>
  );
}
