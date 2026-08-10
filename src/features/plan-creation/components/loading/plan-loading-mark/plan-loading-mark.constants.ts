import type { Transition } from "framer-motion";

export const LOADING_MARK_ANIMATION_TIMING = [0, 0.28, 0.5, 0.54, 0.64, 1];
export const LOADING_MARK_ANIMATION_DURATION = 1.45;
const LOADING_MARK_PARTICLE_TIMING = [0, 0.5, 0.53, 0.75, 1];

export const LOADING_MARK_LOOP_TRANSITION: Transition = {
  duration: LOADING_MARK_ANIMATION_DURATION,
  repeat: Infinity,
  times: LOADING_MARK_ANIMATION_TIMING,
};

export const LOADING_MARK_PARTICLE_TRANSITION: Transition = {
  duration: LOADING_MARK_ANIMATION_DURATION,
  repeat: Infinity,
  times: LOADING_MARK_PARTICLE_TIMING,
  ease: ["linear", "linear", "easeOut", "easeIn"],
};

export const PLAN_CREATION_LOADING_LABELS = [
  "Finding available people...",
  "Checking your group settings...",
  "Reviewing shared interests...",
  "Preparing the group...",
  "Preparing your group...",
  "Almost ready...",
];

const LOADING_MARK_PARTICLES = [
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

export const LOADING_MARK_PARTICLE_ANIMATIONS = LOADING_MARK_PARTICLES.map(
  (particle) =>
    Object.assign({}, particle, {
      animate: {
        opacity: [0, 0, 1, 0.82, 0],
        scale: [0, 0, 1, 0.82, 0],
        x: [0, 0, particle.dx * 1.1, particle.dx * 1.15, particle.dx * 1.2],
        y: [0, 0, particle.dy * 1.1, particle.dy + 10, particle.dy + 25],
      },
    }),
);
