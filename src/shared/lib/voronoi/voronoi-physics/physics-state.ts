import { ANIMATION_CONFIG } from "@/shared/constants/voronoi.constants";
import type { Dimensions, VoronoiFormationLayout } from "../voronoi-contract";
import type { ParticlePhysicsState } from "./types";

export function getParticlePhysicsState({
  currentProgress,
  dimensions,
  formation,
  time,
}: {
  currentProgress: number;
  dimensions: Dimensions;
  formation: VoronoiFormationLayout;
  time: number;
}): ParticlePhysicsState {
  const centerX = formation.center.x;
  const centerY = formation.center.y;

  const driftingCenterX =
    centerX +
    Math.cos(time * 0.3) * (ANIMATION_CONFIG.driftRadius * 0.18) +
    Math.sin(time * 0.4) * (ANIMATION_CONFIG.driftRadius * 0.08);
  const driftingCenterY =
    centerY +
    Math.sin(time * 0.35) * (ANIMATION_CONFIG.driftRadius * 0.18) +
    Math.cos(time * 0.45) * (ANIMATION_CONFIG.driftRadius * 0.08);

  const guardPadding = Math.min(dimensions.width, dimensions.height) * 0.04;
  const guardRadiusX = formation.bounds.width / 2 + guardPadding;
  const guardRadiusY = formation.bounds.height / 2 + guardPadding;
  const exclusionPadding =
    Math.min(dimensions.width, dimensions.height) *
    (0.025 + currentProgress * 0.025);
  const exclusionRadiusX = formation.bounds.width / 2 + exclusionPadding;
  const exclusionRadiusY = formation.bounds.height / 2 + exclusionPadding;
  const easedProgress =
    currentProgress * currentProgress * (3 - 2 * currentProgress);
  const particlePhase =
    currentProgress > 0.9 ? Math.min((currentProgress - 0.9) / 0.1, 1) : 0;
  const breathStrength = 1 - particlePhase;

  return {
    breathStrength,
    centerX,
    centerY,
    driftingCenterX,
    driftingCenterY,
    easedProgress,
    exclusionRadiusX,
    exclusionRadiusY,
    guardRadiusX,
    guardRadiusY,
    particlePhase,
  };
}
