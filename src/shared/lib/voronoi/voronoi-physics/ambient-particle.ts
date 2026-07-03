import { ANIMATION_CONFIG } from "@/shared/constants/voronoi.constants";
import type { Dimensions, Point } from "../voronoi-contract";
import { applyFrictionAndMove } from "./motion";
import type { MousePhysicsState, ParticlePhysicsState } from "./types";

export function updateAmbientParticle({
  currentProgress,
  dimensions,
  mouseState,
  physicsState,
  point,
}: {
  currentProgress: number;
  dimensions: Dimensions;
  mouseState: MousePhysicsState;
  physicsState: ParticlePhysicsState;
  point: Point;
}) {
  randomlyNudgeAmbientTarget(point);
  pushAmbientTargetOutsideExclusion({
    currentProgress,
    physicsState,
    point,
  });
  keepAmbientTargetNearCanvas(point, dimensions);
  pullAmbientParticleTowardTarget(point);
  applyMouseRepulsion({
    mouseState,
    point,
  });
  applyFrictionAndMove(point, ANIMATION_CONFIG.friction);
}

function randomlyNudgeAmbientTarget(point: Point) {
  if (Math.random() < 0.02) {
    point.targetX += (Math.random() - 0.5) * 15;
    point.targetY += (Math.random() - 0.5) * 15;
  }
}

function pushAmbientTargetOutsideExclusion({
  currentProgress,
  physicsState,
  point,
}: {
  currentProgress: number;
  physicsState: ParticlePhysicsState;
  point: Point;
}) {
  const txDx = point.targetX - physicsState.driftingCenterX;
  const tyDy = point.targetY - physicsState.driftingCenterY;
  const tDist = Math.sqrt(txDx * txDx + tyDy * tyDy);

  if (tDist < physicsState.exclusionRadius && tDist > 0) {
    const push =
      (physicsState.exclusionRadius - tDist) *
      0.05 *
      Math.max(0.1, currentProgress);
    point.targetX += (txDx / tDist) * push;
    point.targetY += (tyDy / tDist) * push;
  }
}

function keepAmbientTargetNearCanvas(point: Point, dimensions: Dimensions) {
  point.targetX = nudgeAmbientTargetAxisNearCanvas({
    lowerBound: -dimensions.width * 0.1,
    upperBound: dimensions.width * 1.1,
    value: point.targetX,
  });
  point.targetY = nudgeAmbientTargetAxisNearCanvas({
    lowerBound: -dimensions.height * 0.1,
    upperBound: dimensions.height * 1.1,
    value: point.targetY,
  });
}

function nudgeAmbientTargetAxisNearCanvas({
  lowerBound,
  upperBound,
  value,
}: {
  lowerBound: number;
  upperBound: number;
  value: number;
}) {
  let nextValue = value;

  if (nextValue < lowerBound) nextValue += 5;
  if (nextValue > upperBound) nextValue -= 5;

  return nextValue;
}

function pullAmbientParticleTowardTarget(point: Point) {
  point.vx += (point.targetX - point.x) * ANIMATION_CONFIG.springConstant;
  point.vy += (point.targetY - point.y) * ANIMATION_CONFIG.springConstant;
}

function applyMouseRepulsion({
  mouseState,
  point,
}: {
  mouseState: MousePhysicsState;
  point: Point;
}) {
  const mDistX = point.x - mouseState.mouseX;
  const mDistY = point.y - mouseState.mouseY;
  const mDist = Math.sqrt(mDistX * mDistX + mDistY * mDistY);

  if (
    mDist < ANIMATION_CONFIG.repulsionRadius &&
    mDist > 0 &&
    mouseState.mouseActive
  ) {
    const push =
      (1 - mDist / ANIMATION_CONFIG.repulsionRadius) ** 2 *
      ANIMATION_CONFIG.repulsionForce;
    point.vx += (mDistX / mDist) * push;
    point.vy += (mDistY / mDist) * push;
  }
}
