export const COLORS = {
  forgeTeal: "#0D9488",
  sparkAmber: "#F59E0B",
  amberLight: "#FFFBEB",
} as const;

export const NUM_SEEDS = 36;
export const NUM_CORE = 4;
export const NUM_GUARD = 8; // 4 + 8 = 12 total top-tier nodes

export const GUARD_OFFSETS = [
  { x: -1.1, y: -1.1 },
  { x: 0, y: -0.6 },
  { x: 1.1, y: -1.1 },
  { x: -0.6, y: 0 },
  { x: 0.6, y: 0 },
  { x: -1.1, y: 1.1 },
  { x: 0, y: 0.6 },
  { x: 1.1, y: 1.1 },
] as const;

export const CORE_ANGLES = [
  -145 * (Math.PI / 180),
  -25 * (Math.PI / 180),
  55 * (Math.PI / 180),
  130 * (Math.PI / 180),
] as const;

export const ANIMATION_CONFIG = {
  lerpRate: 0.04,
  progressSpeed: 0.01,
  typingFadeIn: 0.05,
  typingFadeOut: 0.02,
  parallaxFactor: 0.06,
  frameParallaxFactor: 0.05,
  driftRadius: 15,
  friction: 0.94,
  springConstant: 0.004,
  repulsionForce: 0.75,
  repulsionRadius: 230,
  hoverRadius: 230,
} as const;

export const AUTH_TYPING_EVENT = "teamforge:auth-typing";
