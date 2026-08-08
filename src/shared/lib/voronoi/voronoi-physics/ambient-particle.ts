import { ANIMATION_CONFIG } from "@/shared/constants/voronoi.constants";
import type { Dimensions, Point } from "../voronoi-contract";
import { applyFrictionAndMove } from "./motion";
import type { MousePhysicsState, ParticlePhysicsState } from "./types";

export function updateAmbientParticle({
  currentProgress,
  dimensions,
  frameScale,
  mouseState,
  physicsState,
  point,
  settleInstantly,
}: {
  currentProgress: number;
  dimensions: Dimensions;
  frameScale: number;
  mouseState: MousePhysicsState;
  physicsState: ParticlePhysicsState;
  point: Point;
  settleInstantly: boolean;
}) {
  randomlyNudgeAmbientTarget(point, frameScale);
  pushAmbientTargetOutsideExclusion({
    currentProgress,
    physicsState,
    point,
  });
  keepAmbientTargetNearCanvas(point, dimensions);
  pullAmbientParticleTowardTarget(point, frameScale);
  applyMouseRepulsion({
    mouseState,
    point,
    frameScale,
  });
  if (settleInstantly) {
    point.x = point.targetX;
    point.y = point.targetY;
    point.vx = 0;
    point.vy = 0;
    return;
  }
  applyFrictionAndMove(point, ANIMATION_CONFIG.friction, frameScale);
}

function randomlyNudgeAmbientTarget(point: Point, frameScale: number) {
  const probability = 1 - (1 - 0.02) ** frameScale;
  if (Math.random() < probability) {
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
  const normalizedDistance = Math.sqrt(
    (txDx / physicsState.exclusionRadiusX) ** 2 +
      (tyDy / physicsState.exclusionRadiusY) ** 2,
  );

  if (normalizedDistance < 1 && normalizedDistance > 0) {
    const boundaryScale = 1 / normalizedDistance;
    const boundaryX = physicsState.driftingCenterX + txDx * boundaryScale;
    const boundaryY = physicsState.driftingCenterY + tyDy * boundaryScale;
    const pushResponse = 0.08 * Math.max(0.1, currentProgress);
    point.targetX += (boundaryX - point.targetX) * pushResponse;
    point.targetY += (boundaryY - point.targetY) * pushResponse;
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

function pullAmbientParticleTowardTarget(point: Point, frameScale: number) {
  point.vx +=
    (point.targetX - point.x) * ANIMATION_CONFIG.springConstant * frameScale;
  point.vy +=
    (point.targetY - point.y) * ANIMATION_CONFIG.springConstant * frameScale;
}

function applyMouseRepulsion({
  mouseState,
  point,
  frameScale,
}: {
  mouseState: MousePhysicsState;
  point: Point;
  frameScale: number;
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
    point.vx += (mDistX / mDist) * push * frameScale;
    point.vy += (mDistY / mDist) * push * frameScale;
  }
}
