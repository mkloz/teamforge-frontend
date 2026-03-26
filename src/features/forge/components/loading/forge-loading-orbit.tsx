"use client";

/**
 * Concept D — "Orbital Assembly" (Alternative — Abstract Geometric)
 * Abstract style. Person-tokens orbit a central hub in elliptical paths,
 * snapping into a ring formation as the algorithm converges. Communicates
 * "assembly from scattered individuals into a connected group."
 */

import { cn } from "@/shared/lib/utils";

interface ForgeLoadingOrbitProps {
  progress?: number;
  label?: string;
  className?: string;
  memberCount?: number;
}

const TEAL = "#0d9488";
const AMBER = "#f59e0b";

export function ForgeLoadingOrbit({
  progress = 0,
  label = "Assembling your group...",
  className,
  memberCount = 5,
}: ForgeLoadingOrbitProps) {
  const size = 176;
  const cx = size / 2;
  const cy = size / 2;
  const orbitR = 58;
  const convergence = progress / 100; // 0 → scattered, 1 → ring

  // Each token starts at a random-looking "scattered" angle offset and converges
  const tokens = Array.from({ length: memberCount }, (_, i) => {
    const finalAngle = (i / memberCount) * Math.PI * 2 - Math.PI / 2;
    // Scattered start: offset the angle significantly
    const scatterOffset = (i % 2 === 0 ? 1 : -1) * (0.8 - i * 0.12);
    const angle = finalAngle + scatterOffset * (1 - convergence);
    // Radius pulses from wider orbit to tight ring
    const r = orbitR + (1 - convergence) * (i % 2 === 0 ? 24 : -16);
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      isSelf: i === 0,
      angle,
    };
  });

  // Draw connection lines when converged enough
  const showLines = progress > 55;
  const lineOpacity = Math.max(0, (progress - 55) / 45);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 select-none", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Orbit path guide */}
          <circle
            cx={cx} cy={cy} r={orbitR}
            fill="none"
            stroke={TEAL}
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.2"
          />

          {/* Connection lines */}
          {showLines && tokens.map((t, i) => {
            const next = tokens[(i + 1) % tokens.length];
            return (
              <line
                key={`line-${i}`}
                x1={t.x} y1={t.y}
                x2={next.x} y2={next.y}
                stroke={TEAL}
                strokeWidth="1.5"
                opacity={lineOpacity * 0.4}
                strokeLinecap="round"
              />
            );
          })}

          {/* Central hub */}
          <circle cx={cx} cy={cy} r={14} fill={TEAL} opacity="0.12" />
          <circle cx={cx} cy={cy} r={8} fill={TEAL} opacity="0.9">
            <animate
              attributeName="r"
              values="8;10;8"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">
            TF
          </text>

          {/* Progress arc */}
          {(() => {
            const r = orbitR + 22;
            const circ = 2 * Math.PI * r;
            const dash = (progress / 100) * circ;
            return (
              <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={AMBER}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                transform={`rotate(-90 ${cx} ${cy})`}
                opacity="0.7"
                style={{ transition: "stroke-dasharray 0.4s ease" }}
              />
            );
          })()}

          {/* Tokens */}
          {tokens.map((t, i) => (
            <g key={i} style={{ transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
              {/* Glow */}
              <circle
                cx={t.x} cy={t.y} r={t.isSelf ? 13 : 11}
                fill={t.isSelf ? AMBER : TEAL}
                opacity="0.15"
              />
              {/* Token circle */}
              <circle
                cx={t.x} cy={t.y} r={t.isSelf ? 9 : 7.5}
                fill={t.isSelf ? AMBER : "#1f2937"}
                stroke={t.isSelf ? AMBER : TEAL}
                strokeWidth="1.5"
              />
              {/* Person icon silhouette */}
              <circle cx={t.x} cy={t.y - 2} r={2.5} fill={t.isSelf ? "#1c1c1a" : TEAL} opacity="0.9" />
              <path
                d={`M${t.x - 3.5} ${t.y + 5.5} Q${t.x} ${t.y + 3} ${t.x + 3.5} ${t.y + 5.5}`}
                stroke={t.isSelf ? "#1c1c1a" : TEAL}
                strokeWidth="1.5"
                fill="none"
                opacity="0.9"
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {progress < 40 ? "Scanning profiles..." : progress < 75 ? "Finding compatibility..." : "Forming the group..."}
        </p>
      </div>
    </div>
  );
}
