import { m } from "framer-motion";

import {
  LOADING_MARK_ANIMATION_TIMING,
  LOADING_MARK_LOOP_TRANSITION,
} from "./plan-loading-mark.constants";

export function LoadingAmbientEffects() {
  return (
    <>
      <m.path
        d="M58 160C75.5 151 143.5 151 162 160"
        stroke="var(--color-brand-teal)"
        strokeLinecap="round"
        strokeWidth="3"
        animate={{
          opacity: [0.18, 0.18, 0.26, 0.62, 0.24, 0.18],
          pathLength: [0.68, 0.68, 0.8, 0.98, 0.84, 0.68],
        }}
        transition={{
          ...LOADING_MARK_LOOP_TRANSITION,
          ease: "easeOut",
        }}
      />

      <m.ellipse
        cx="110"
        cy="156"
        rx="48"
        ry="8"
        fill="var(--color-brand-teal)"
        animate={{
          opacity: [0.06, 0.06, 0.08, 0.16, 0.1, 0.06],
          scaleX: [0.92, 0.92, 0.96, 1.04, 0.98, 0.92],
        }}
        transition={{
          ...LOADING_MARK_LOOP_TRANSITION,
          ease: "easeOut",
        }}
      />

      <m.ellipse
        cx="110"
        cy="111"
        rx="24"
        ry="6"
        fill="var(--color-brand-amber)"
        animate={{
          opacity: [0, 0, 0.16, 0.72, 0.16, 0],
          scale: [0.7, 0.7, 0.82, 1.12, 1, 0.7],
        }}
        transition={{
          ...LOADING_MARK_LOOP_TRANSITION,
          ease: ["linear", "linear", "linear", "easeOut", "linear"],
          times: LOADING_MARK_ANIMATION_TIMING,
        }}
      />
    </>
  );
}
