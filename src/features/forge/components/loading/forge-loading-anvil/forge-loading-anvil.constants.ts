import type { Transition } from "framer-motion";

export const ANVIL_ANIMATION_TIMING = [0, 0.28, 0.5, 0.54, 0.64, 1];
export const ANVIL_ANIMATION_DURATION = 1.45;
export const ANVIL_SPARK_TIMING = [0, 0.5, 0.53, 0.75, 1];

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
  "Checking group fit...",
  "Balancing the lineup...",
  "Reviewing shared interests...",
  "Shaping the group...",
  "Preparing your group...",
  "Almost ready...",
];

export const ANVIL_SPARKS = [
  { id: 1, dx: -22, dy: -5, size: 4 },
  { id: 2, dx: 18, dy: -8, size: 3.5 },
  { id: 3, dx: -12, dy: 6, size: 4.5 },
  { id: 4, dx: 26, dy: 2, size: 3 },
  { id: 5, dx: -32, dy: 0, size: 3 },
  { id: 6, dx: 12, dy: 10, size: 4 },
  { id: 8, dx: 22, dy: 12, size: 3 },
  { id: 10, dx: 32, dy: -6, size: 4 },
  { id: 11, dx: -26, dy: 12, size: 3 },
  { id: 15, dx: 0, dy: 16, size: 4 },
];

export const ANVIL_SPARK_ANIMATIONS = ANVIL_SPARKS.map((spark) =>
  Object.assign({}, spark, {
    animate: {
      opacity: [0, 0, 1, 0.82, 0],
      scale: [0, 0, 1, 0.82, 0],
      x: [0, 0, spark.dx * 1.1, spark.dx * 1.15, spark.dx * 1.2],
      y: [0, 0, spark.dy * 1.1, spark.dy + 10, spark.dy + 25],
    },
  }),
);
