import { m } from "framer-motion";

import {
  LOADING_MARK_LOOP_TRANSITION,
  LOADING_MARK_PARTICLE_ANIMATIONS,
  LOADING_MARK_PARTICLE_TRANSITION,
} from "./plan-loading-mark.constants";

export function LoadingParticles() {
  return (
    <>
      <m.path
        className="origin-[110px_107.75px]"
        d="M99 107.75h22"
        stroke="var(--color-brand-amber)"
        strokeLinecap="round"
        strokeWidth="3"
        animate={{
          scaleX: [1, 1, 1, 1.34, 1.08, 1],
        }}
        transition={LOADING_MARK_LOOP_TRANSITION}
      />
      {LOADING_MARK_PARTICLE_ANIMATIONS.map((particle) => (
        <m.circle
          key={particle.id}
          cx="110"
          cy="108"
          r={particle.size}
          fill="var(--color-brand-amber)"
          animate={particle.animate}
          transition={LOADING_MARK_PARTICLE_TRANSITION}
        />
      ))}
    </>
  );
}
