import type { Transition } from "framer-motion";

export const ANVIL_ANIMATION_TIMING = [0, 0.28, 0.5, 0.54, 0.64, 1];
export const ANVIL_ANIMATION_DURATION = 1.45;
export const ANVIL_SPARK_TIMING = [0, 0.5, 0.53, 0.75, 1];
export const ANVIL_SPARK_FILTER =
  "drop-shadow(0px 0px 3px rgba(245,158,11,0.8))";

export const ANVIL_LOOP_TRANSITION: Transition = {
  duration: ANVIL_ANIMATION_DURATION,
  repeat: Infinity,
  times: ANVIL_ANIMATION_TIMING,
};

export const ANVIL_SPARK_TRANSITION: Transition = {
  duration: ANVIL_ANIMATION_DURATION,
  repeat: Infinity,
  times: ANVIL_SPARK_TIMING,
  ease: ["linear", "linear", "easeOut", "easeIn"],
};

export const FORGE_LOADING_LABELS = [
  "Checking compatibility...",
  "Balancing the lineup...",
  "Reviewing group fit...",
  "Finding the strongest match...",
  "Preparing your group...",
  "Almost ready...",
];

export const ANVIL_SPARKS = [
  { id: 1, dx: -22, dy: -5, size: 5, color: "var(--color-spark-amber)" },
  { id: 2, dx: 18, dy: -8, size: 4, color: "var(--color-spark-amber)" },
  { id: 3, dx: -12, dy: 6, size: 6, color: "var(--color-spark-amber)" },
  { id: 4, dx: 26, dy: 2, size: 3, color: "var(--color-spark-amber)" },
  { id: 5, dx: -32, dy: 0, size: 4, color: "var(--color-spark-amber)" },
  { id: 6, dx: 12, dy: 10, size: 5, color: "var(--color-spark-amber)" },
  { id: 8, dx: 22, dy: 12, size: 4, color: "var(--color-spark-amber)" },
  { id: 10, dx: 32, dy: -6, size: 5, color: "var(--color-spark-amber)" },
  { id: 11, dx: -26, dy: 12, size: 3, color: "var(--color-spark-amber)" },
  { id: 13, dx: -38, dy: 4, size: 3, color: "var(--color-spark-amber)" },
  { id: 14, dx: 36, dy: 8, size: 4, color: "var(--color-spark-amber)" },
  { id: 15, dx: 0, dy: 16, size: 5, color: "var(--color-spark-amber)" },
  { id: 16, dx: -10, dy: 20, size: 3, color: "var(--color-spark-amber)" },
  { id: 18, dx: -20, dy: -10, size: 4, color: "var(--color-spark-amber)" },
];

export const ANVIL_SPARK_ANIMATIONS = ANVIL_SPARKS.map((spark) => ({
  ...spark,
  animate: {
    opacity: [0, 0, 1, 0.8, 0],
    scale: [0, 0, 1, 0.8, 0],
    x: [0, 0, spark.dx * 1.1, spark.dx * 1.15, spark.dx * 1.2],
    y: [0, 0, spark.dy * 1.1, spark.dy + 10, spark.dy + 25],
  },
}));
