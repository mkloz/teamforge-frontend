export const COLORS = {
  forgeTeal: "#0D9488",
  sparkAmber: "#F59E0B",
  amberLight: "#FFFBEB",
} as const;

export const NUM_SEEDS = 216;
export const NUM_FORMATION = 128;
export const NUM_GUARD = 40;

export function getVoronoiCanvasScale(rotationDegrees: number) {
  return rotationDegrees === 0 ? 1 : 1.25;
}

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
  progressResponse: 2.8,
  pointerResponse: 7.2,
  typingResponseIn: 7.5,
  typingResponseOut: 3.2,
} as const;
