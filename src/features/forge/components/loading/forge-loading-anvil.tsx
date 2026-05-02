"use client";

/**
 * ForgeLoadingAnvil — Infinite hammer-strike loading animation.
 * SVG + framer-motion. No canvas. Runs forever until unmounted.
 * Label cycles on every hammer impact.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

// Deterministic spark positions matching the dense clustered cloud
const SPARKS = [
  { id: 1, dx: -22, dy: -5, size: 5, color: "var(--color-spark-amber)" },
  { id: 2, dx: 18, dy: -8, size: 4, color: "var(--color-spark-amber)" },
  { id: 3, dx: -12, dy: 6, size: 6, color: "var(--color-spark-amber)" },
  { id: 4, dx: 26, dy: 2, size: 3, color: "var(--color-spark-amber)" },
  { id: 5, dx: -32, dy: 0, size: 4, color: "var(--color-spark-amber)" },
  { id: 6, dx: 12, dy: 10, size: 5, color: "var(--color-spark-amber)" },
  { id: 7, dx: -6, dy: -14, size: 3, color: "var(--color-spark-amber)" },
  { id: 8, dx: 22, dy: 12, size: 4, color: "var(--color-spark-amber)" },
  { id: 9, dx: -16, dy: -16, size: 2, color: "var(--color-spark-amber)" },
  { id: 10, dx: 32, dy: -6, size: 5, color: "var(--color-spark-amber)" },
  { id: 11, dx: -26, dy: 12, size: 3, color: "var(--color-spark-amber)" },
  { id: 12, dx: 6, dy: -20, size: 4, color: "var(--color-spark-amber)" },
  { id: 13, dx: -38, dy: 4, size: 3, color: "var(--color-spark-amber)" },
  { id: 14, dx: 36, dy: 8, size: 4, color: "var(--color-spark-amber)" },
  { id: 15, dx: 0, dy: 16, size: 5, color: "var(--color-spark-amber)" },
  { id: 16, dx: -10, dy: 20, size: 3, color: "var(--color-spark-amber)" },
  { id: 17, dx: 20, dy: -14, size: 2, color: "var(--color-spark-amber)" },
  { id: 18, dx: -20, dy: -10, size: 4, color: "var(--color-spark-amber)" },
];

// Keyframe timing: [lift, peak-hang, impact, recoil, rest]
const TIMING = [0, 0.35, 0.5, 0.53, 0.65, 1];
const DURATION = 1.6; // seconds per cycle

// Impact is at t = 0.5 * DURATION = 0.8 s into each cycle.
// We schedule the label update slightly after impact for a natural feel.
const IMPACT_OFFSET_MS = DURATION * 0.5 * 1000; // 800 ms

// Labels that rotate on each hammer strike
const FORGE_LABELS = [
  "Lighting the forge...",
  "Heating the metal...",
  "Shaping your group...",
  "Tempering the bonds...",
  "Finding your people...",
  "Almost there...",
];

interface ForgeLoadingAnvilProps {
  label?: string;
  className?: string;
  size?: number;
}

export function ForgeLoadingAnvil({
  label,
  className,
  size = 180,
}: ForgeLoadingAnvilProps) {
  const shouldReduceMotion = useReducedMotion();

  // Cycle through FORGE_LABELS on every hammer impact
  const [labelIdx, setLabelIdx] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || label) return;

    // Fire exactly at the first impact then every full cycle thereafter.
    // We use a timeout to align the first tick to the impact moment,
    // then a stable interval for all subsequent hits.
    let interval: ReturnType<typeof setInterval> | null = null;

    const firstHit = setTimeout(() => {
      setLabelIdx((i) => (i + 1) % FORGE_LABELS.length);
      interval = setInterval(() => {
        setLabelIdx((i) => (i + 1) % FORGE_LABELS.length);
      }, DURATION * 1000);
    }, IMPACT_OFFSET_MS);

    return () => {
      clearTimeout(firstHit);
      if (interval !== null) clearInterval(interval);
    };
  }, [label, shouldReduceMotion]);

  const displayLabel = label ?? FORGE_LABELS[labelIdx];

  if (shouldReduceMotion) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-6 select-none",
          className,
        )}
        style={{ width: size, height: size }}
        role="status"
        aria-label={displayLabel}
      >
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 bg-spark-amber rounded-sm rotate-45"
        />
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {displayLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            This may take a moment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 select-none",
        className,
      )}
      role="status"
      aria-label={displayLabel}
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
            fill="var(--color-spark-amber)"
            animate={{
              opacity: [0, 0, 0, 0.4, 0, 0],
              scale: [0, 0, 0, 1.2, 1.5, 0],
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
              y: [0, 0, 0, 4, -1, 0],
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
            <rect x="80" y="134" width="40" height="5" rx="3" fill="#4b5563" />
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
              style={{
                filter: "drop-shadow(0px 0px 3px rgba(245,158,11,0.8))",
              }}
              animate={{
                opacity: [0, 0, 1, 0.8, 0],
                scale: [0, 0, 1, 0.8, 0],
                x: [0, 0, spark.dx * 1.1, spark.dx * 1.15, spark.dx * 1.2],
                y: [0, 0, spark.dy * 1.1, spark.dy + 10, spark.dy + 25],
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
              ease: [
                "easeOut",
                "easeInOut",
                [0.8, 0, 1, 1],
                "easeOut",
                "easeInOut",
              ],
            }}
          >
            {/* Handle */}
            <rect x="105" y="117" width="38" height="6" rx="3" fill="#78350f" />
            {/* Head */}
            <rect x="91" y="106" width="18" height="28" rx="4" fill="#374151" />
            {/* Head highlight */}
            <rect x="91" y="106" width="6" height="28" rx="3" fill="#4b5563" />
          </motion.g>
        </svg>
      </div>

      {/* Animated label — crossfades on each hammer hit */}
      <div className="text-center space-y-1 min-h-12 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={label ?? labelIdx}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-sm font-semibold text-foreground"
          >
            {displayLabel}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-muted-foreground">
          This may take a moment...
        </p>
      </div>
    </div>
  );
}
