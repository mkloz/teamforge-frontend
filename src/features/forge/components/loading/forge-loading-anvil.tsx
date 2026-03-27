"use client";

/**
 * ForgeLoadingAnvil — Infinite hammer-strike loading animation.
 * SVG + framer-motion. No canvas. Runs forever until unmounted.
 */

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

// Deterministic spark positions matching the dense clustered cloud
const SPARKS = [
  { id: 1,  dx: -22, dy: -5,  size: 5, color: "#FBBF24" },
  { id: 2,  dx:  18, dy: -8,  size: 4, color: "#F59E0B" },
  { id: 3,  dx: -12, dy:  6,  size: 6, color: "#FCD34D" },
  { id: 4,  dx:  26, dy:  2,  size: 3, color: "#FBBF24" },
  { id: 5,  dx: -32, dy:  0,  size: 4, color: "#F59E0B" },
  { id: 6,  dx:  12, dy: 10,  size: 5, color: "#FBBF24" },
  { id: 7,  dx:  -6, dy: -14, size: 3, color: "#FCD34D" },
  { id: 8,  dx:  22, dy: 12,  size: 4, color: "#F59E0B" },
  { id: 9,  dx: -16, dy: -16, size: 2, color: "#FBBF24" },
  { id: 10, dx:  32, dy: -6,  size: 5, color: "#FCD34D" },
  { id: 11, dx: -26, dy: 12,  size: 3, color: "#F59E0B" },
  { id: 12, dx:   6, dy: -20, size: 4, color: "#FBBF24" },
  { id: 13, dx: -38, dy:  4,  size: 3, color: "#FCD34D" },
  { id: 14, dx:  36, dy:  8,  size: 4, color: "#F59E0B" },
  { id: 15, dx:   0, dy: 16,  size: 5, color: "#FBBF24" },
  { id: 16, dx: -10, dy: 20,  size: 3, color: "#FCD34D" },
  { id: 17, dx:  20, dy: -14, size: 2, color: "#F59E0B" },
  { id: 18, dx: -20, dy: -10, size: 4, color: "#FBBF24" },
];

// Keyframe timing: [lift, peak-hang, impact, recoil, rest]
const TIMING = [0, 0.35, 0.5, 0.53, 0.65, 1];
const DURATION = 2.0;

interface ForgeLoadingAnvilProps {
  label?: string;
  className?: string;
  size?: number;
}

export function ForgeLoadingAnvil({
  label = "Forging your group...",
  className,
  size = 180,
}: ForgeLoadingAnvilProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        className={cn("flex flex-col items-center justify-center gap-6 select-none", className)}
        style={{ width: size, height: size }}
        role="status"
        aria-label={label}
      >
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 bg-[#F59E0B] rounded-sm rotate-45"
        />
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">This may take a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-6 select-none", className)}
      role="status"
      aria-label={label}
    >
      {/* SVG stage */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-md"
        >
          {/* Impact glow ellipse */}
          <motion.ellipse
            cx="100"
            cy="134"
            rx="40"
            ry="12"
            fill="#F59E0B"
            animate={{
              opacity: [0, 0, 0, 0.4, 0, 0],
              scale:   [0, 0, 0, 1.2, 1.5, 0],
            }}
            transition={{
              duration: DURATION,
              repeat: Infinity,
              times: TIMING,
              ease: ["linear", "linear", "linear", "easeOut", "linear"],
            }}
            className="blur-xl"
          />

          {/* Anvil — squashes on impact */}
          <motion.g
            style={{ transformOrigin: "100px 168px" }}
            animate={{
              scaleY: [1, 1, 1, 0.8, 1.03, 1],
              y:      [0, 0, 0,   4,   -1, 0],
            }}
            transition={{
              duration: DURATION,
              repeat: Infinity,
              times: TIMING,
              ease: ["easeOut", "easeInOut", "easeIn", "easeOut", "easeInOut"],
            }}
          >
            {/* Top tier */}
            <rect x="80" y="134" width="40" height="18" rx="4" fill="#374151" />
            <rect x="80" y="134" width="40" height="5"  rx="3" fill="#4b5563" />
            {/* Middle tier */}
            <rect x="86" y="152" width="28" height="8" rx="2" fill="#1f2937" />
            {/* Base */}
            <rect x="90" y="160" width="20" height="8" rx="2" fill="#111827" />
          </motion.g>

          {/* Sparks — burst from impact point */}
          {SPARKS.map((spark) => (
            <motion.circle
              key={spark.id}
              cx="100"
              cy="134"
              r={spark.size}
              fill={spark.color}
              style={{ filter: "drop-shadow(0px 0px 3px rgba(245,158,11,0.8))" }}
              animate={{
                opacity: [0, 0,            1,          0.8,              0],
                scale:   [0, 0,            1,          0.8,              0],
                x:       [0, 0, spark.dx * 1.1, spark.dx * 1.15, spark.dx * 1.2],
                y:       [0, 0, spark.dy * 1.1, spark.dy + 10,   spark.dy + 25],
              }}
              transition={{
                duration: DURATION,
                repeat: Infinity,
                times: [0, 0.5, 0.53, 0.75, 1],
                ease: ["linear", "linear", "easeOut", "easeIn"],
              }}
            />
          ))}

          {/* Hammer — rotates from pivot at right end of handle */}
          <motion.g
            style={{ transformOrigin: "143px 120px" }}
            animate={{
              rotate: [0, 55, 60, -3, 3, 0],
            }}
            transition={{
              duration: DURATION,
              repeat: Infinity,
              times: TIMING,
              ease: ["easeOut", "easeInOut", [0.8, 0, 1, 1], "easeOut", "easeInOut"],
            }}
          >
            {/* Handle */}
            <rect x="105" y="117" width="38" height="6" rx="3" fill="#78350f" />
            {/* Head */}
            <rect x="91" y="106" width="18" height="28" rx="4" fill="#374151" />
            {/* Head highlight */}
            <rect x="91" y="106" width="6"  height="28" rx="3" fill="#4b5563" />
          </motion.g>
        </svg>
      </div>

      {/* Labels */}
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">This may take a moment...</p>
      </div>
    </div>
  );
}
