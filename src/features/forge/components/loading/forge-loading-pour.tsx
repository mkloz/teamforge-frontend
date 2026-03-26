"use client";

/**
 * Concept C — "Molten Pour"
 * Forge-themed. A ladle tilts and pours glowing molten metal into a mold.
 * The mold fills as progress increases, solidifying from amber to grey-silver.
 * Drips fall from the ladle tip with gravity and glow on impact.
 */

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";

interface ForgeLoadingPourProps {
  progress?: number;
  label?: string;
  className?: string;
}

export function ForgeLoadingPour({
  progress = 0,
  label = "Casting the group...",
  className,
}: ForgeLoadingPourProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    type Drip = { x: number; y: number; vy: number; size: number; life: number };
    const drips: Drip[] = [];
    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      tick++;

      // Spawn drips from ladle tip (roughly center-right)
      if (tick % 5 === 0) {
        drips.push({
          x: W * 0.52 + (Math.random() - 0.5) * 6,
          y: H * 0.25,
          vy: 0.8 + Math.random() * 0.4,
          size: Math.random() * 2.5 + 1,
          life: 1,
        });
      }

      const moldTopY = H * 0.62;

      drips.forEach((d, i) => {
        d.y += d.vy;
        d.vy += 0.22;
        if (d.y >= moldTopY) {
          // Splash — short glow burst
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = "#f59e0b";
          ctx.shadowBlur = 14;
          ctx.shadowColor = "#f59e0b";
          ctx.beginPath();
          ctx.ellipse(d.x, moldTopY, 5, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          drips.splice(i, 1);
          return;
        }
        ctx.save();
        ctx.globalAlpha = d.life * 0.95;
        ctx.fillStyle = "#fbbf24";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#f59e0b";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // Mold fill color transitions amber → silver as it solidifies
  const fillColor = progress > 80 ? "#9ca3af" : progress > 50 ? "#d97706" : "#f59e0b";
  const fillHeight = (progress / 100) * 44;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 select-none", className)}>
      <div className="relative w-44 h-44 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={176}
          height={176}
          className="absolute inset-0 pointer-events-none"
        />

        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="relative z-10">
          {/* Ladle — tilted */}
          <g transform="rotate(-30, 72, 40)">
            {/* Handle */}
            <rect x="70" y="14" width="6" height="36" rx="3" fill="#78350f" />
            {/* Bowl */}
            <path d="M54 44 Q72 56 90 44 L86 52 Q72 60 58 52 Z" fill="#374151" />
            {/* Molten contents */}
            <path d="M58 46 Q72 56 86 46 L84 50 Q72 58 60 50 Z" fill="#f59e0b" opacity="0.9" />
            <ellipse cx="72" cy="46" rx="14" ry="4" fill="#fbbf24" opacity="0.6" />
          </g>

          {/* Mold / crucible */}
          <g transform="translate(40, 84)">
            {/* Outer shell */}
            <path d="M0 0 L8 48 L52 48 L60 0 Z" fill="#1f2937" />
            <path d="M0 0 L60 0 L56 6 L4 6 Z" fill="#374151" />
            {/* Fill level (clipped) */}
            <clipPath id="mold-clip">
              <path d="M4 6 L8 48 L52 48 L56 6 Z" />
            </clipPath>
            <rect
              x="4"
              y={48 - fillHeight}
              width="52"
              height={fillHeight}
              clipPath="url(#mold-clip)"
              fill={fillColor}
              style={{ transition: "height 0.5s ease, y 0.5s ease, fill 0.5s ease" }}
            />
            {/* Glow on fill surface */}
            {progress > 5 && (
              <ellipse
                cx="30"
                cy={48 - fillHeight}
                rx="22"
                ry="3"
                fill={fillColor}
                opacity="0.4"
                style={{ filter: "blur(3px)", transition: "cy 0.5s ease" }}
              />
            )}
          </g>
        </svg>
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {progress < 40 ? "Pouring..." : progress < 80 ? "Filling the mold..." : "Cooling and solidifying..."}
        </p>
      </div>
    </div>
  );
}
