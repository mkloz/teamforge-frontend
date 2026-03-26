"use client";

/**
 * Concept E — "Signal Wave" (Alternative — Fluid Motion)
 * Abstract / fluid style. Concentric teal signal rings radiate outward from
 * a center point (like a ping or radar sweep), with each completed ring
 * representing a match found. A compact ring counter ticks up as progress
 * increases, communicating "the algorithm is broadcasting and receiving."
 */

import { cn } from "@/shared/lib/utils";

interface ForgeLoadingWaveProps {
  progress?: number;
  label?: string;
  className?: string;
}

const RINGS = [
  { r: 22, delay: "0s", dur: "2s" },
  { r: 36, delay: "0.5s", dur: "2s" },
  { r: 50, delay: "1s", dur: "2s" },
  { r: 64, delay: "1.5s", dur: "2s" },
];

export function ForgeLoadingWave({
  progress = 0,
  label = "Scanning for matches...",
  className,
}: ForgeLoadingWaveProps) {
  const size = 176;
  const cx = size / 2;
  const cy = size / 2;

  const matchesFound = Math.floor((progress / 100) * 5);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 select-none", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
          {/* Animated ping rings */}
          {RINGS.map((ring, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={ring.r}
              fill="none"
              stroke="#0d9488"
              strokeWidth="1.5"
              opacity="0"
            >
              <animate
                attributeName="r"
                from={ring.r * 0.3}
                to={ring.r}
                dur={ring.dur}
                begin={ring.delay}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
              <animate
                attributeName="opacity"
                values="0;0.55;0"
                dur={ring.dur}
                begin={ring.delay}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* Sweep line (radar) */}
          <line
            x1={cx} y1={cy}
            x2={cx} y2={cy - 64}
            stroke="#0d9488"
            strokeWidth="2"
            opacity="0.6"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${cx} ${cy}`}
              to={`360 ${cx} ${cy}`}
              dur="2.4s"
              repeatCount="indefinite"
            />
          </line>

          {/* Sweep gradient fill */}
          <defs>
            <radialGradient id="sweep-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={cx} cy={cy} r={64} fill="url(#sweep-grad)" />

          {/* Center pulse */}
          <circle cx={cx} cy={cy} r={12} fill="#0d9488" opacity="0.15">
            <animate attributeName="r" values="12;16;12" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r={8} fill="#0d9488" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">
            {matchesFound}/{5}
          </text>

          {/* Match dots appearing around ring as progress grows */}
          {Array.from({ length: matchesFound }, (_, i) => {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const mx = cx + Math.cos(angle) * 52;
            const my = cy + Math.sin(angle) * 52;
            return (
              <g key={i}>
                <circle cx={mx} cy={my} r={7} fill="#f59e0b" opacity="0.15" />
                <circle cx={mx} cy={my} r={4.5} fill="#f59e0b" />
                <circle cx={mx - 1} cy={my - 2} r={1.5} fill="#1c1c1a" opacity="0.6" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Progress dots */}
      <div className="space-y-2 text-center">
        <div className="flex items-center gap-1.5 justify-center">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i < matchesFound ? "24px" : "6px",
                height: "6px",
                backgroundColor: i < matchesFound ? "#f59e0b" : "#d1d5db",
              }}
            />
          ))}
        </div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {matchesFound === 0
            ? "Broadcasting signal..."
            : matchesFound < 3
              ? `${matchesFound} match found...`
              : matchesFound < 5
                ? `${matchesFound} strong matches found...`
                : "Group complete!"}
        </p>
      </div>
    </div>
  );
}
