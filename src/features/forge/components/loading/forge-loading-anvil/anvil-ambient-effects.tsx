import { motion } from "framer-motion";

import {
  ANVIL_ANIMATION_TIMING,
  ANVIL_LOOP_TRANSITION,
} from "./forge-loading-anvil.constants";

export function AnvilAmbientEffects() {
  return (
    <>
      <motion.path
        d="M58 160C75.5 151 143.5 151 162 160"
        stroke="var(--color-forge-teal)"
        strokeLinecap="round"
        strokeWidth="2"
        animate={{
          opacity: [0.12, 0.12, 0.22, 0.5, 0.18, 0.12],
          pathLength: [0.68, 0.68, 0.8, 0.98, 0.84, 0.68],
        }}
        transition={{
          ...ANVIL_LOOP_TRANSITION,
          ease: "easeOut",
        }}
      />

      <motion.ellipse
        cx="110"
        cy="156"
        rx="48"
        ry="9"
        fill="var(--color-forge-teal)"
        animate={{
          opacity: [0.14, 0.14, 0.18, 0.28, 0.2, 0.14],
          scaleX: [0.92, 0.92, 0.96, 1.04, 0.98, 0.92],
        }}
        transition={{
          ...ANVIL_LOOP_TRANSITION,
          ease: "easeOut",
        }}
        className="blur-md"
      />

      <motion.ellipse
        cx="110"
        cy="111"
        rx="24"
        ry="6"
        fill="var(--color-spark-amber)"
        animate={{
          opacity: [0, 0, 0.08, 0.34, 0.1, 0],
          scale: [0.7, 0.7, 0.82, 1.16, 1, 0.7],
        }}
        transition={{
          ...ANVIL_LOOP_TRANSITION,
          ease: ["linear", "linear", "linear", "easeOut", "linear"],
          times: ANVIL_ANIMATION_TIMING,
        }}
        className="blur-xl"
      />
    </>
  );
}
