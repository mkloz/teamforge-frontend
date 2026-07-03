import { ANIMATION_CONFIG } from "@/shared/constants/voronoi.constants";
import type { Dimensions } from "../voronoi-contract";
import type { ParticlePhysicsState } from "./types";

export function getParticlePhysicsState({
  currentProgress,
  dimensions,
  time,
}: {
  currentProgress: number;
  dimensions: Dimensions;
  time: number;
}): ParticlePhysicsState {
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const driftingCenterX =
    centerX +
    Math.cos(time * 0.3) * ANIMATION_CONFIG.driftRadius +
    Math.sin(time * 0.4) * (ANIMATION_CONFIG.driftRadius * 0.5);
  const driftingCenterY =
    centerY -
    30 +
    Math.sin(time * 0.35) * ANIMATION_CONFIG.driftRadius +
    Math.cos(time * 0.45) * (ANIMATION_CONFIG.driftRadius * 0.5);

  const guardSize =
    Math.min(dimensions.width, dimensions.height) *
      (0.44 - currentProgress * 0.15) *
      0.53 +
    Math.sin(time * 0.4) * 3.5;
  const exclusionRadius =
    Math.min(dimensions.width, dimensions.height) *
    (0.35 + currentProgress * 0.15) *
    0.35;
  const easedProgress = 1 - (1 - currentProgress) ** 2;
  const sparkPhase =
    currentProgress > 0.85 ? Math.min((currentProgress - 0.85) / 0.15, 1) : 0;
  const breathStrength = 1 - sparkPhase;

  return {
    breathStrength,
    centerX,
    centerY,
    driftingCenterX,
    driftingCenterY,
    easedProgress,
    exclusionRadius,
    guardSize,
    sparkPhase,
  };
}
