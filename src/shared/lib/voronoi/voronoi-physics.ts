import {
  ANIMATION_CONFIG,
  CORE_ANGLES,
  GUARD_OFFSETS,
  NUM_CORE,
  NUM_GUARD,
} from "@/shared/constants/voronoi.constants";
import type { Dimensions, Point } from "./voronoi-contract";

type ParticlePhysicsState = {
  breathStrength: number;
  centerX: number;
  centerY: number;
  driftingCenterX: number;
  driftingCenterY: number;
  easedProgress: number;
  exclusionRadius: number;
  guardSize: number;
  sparkPhase: number;
};

type MousePhysicsState = {
  mouseActive: boolean;
  mouseX: number;
  mouseY: number;
};

export function updateParticlePhysics({
  points,
  time,
  currentProgress,
  isTyping,
  dimensions,
  mouseX,
  mouseY,
  mouseActive,
}: {
  points: Point[];
  time: number;
  currentProgress: number;
  isTyping: boolean;
  dimensions: Dimensions;
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
}) {
  const physicsState = getParticlePhysicsState({
    currentProgress,
    dimensions,
    time,
  });
  const mouseState = {
    mouseActive,
    mouseX,
    mouseY,
  };

  let coreAvgX = 0;
  let coreAvgY = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    if (isCoreParticle(i)) {
      updateCoreParticle({
        currentProgress,
        index: i,
        isTyping,
        physicsState,
        point: p,
        time,
      });

      coreAvgX += p.x;
      coreAvgY += p.y;
    } else if (isGuardParticle(i)) {
      updateGuardParticle({
        index: i,
        physicsState,
        point: p,
        time,
      });
    } else {
      updateAmbientParticle({
        currentProgress,
        dimensions,
        mouseState,
        physicsState,
        point: p,
      });
    }
  }

  return {
    coreAvg: { x: coreAvgX / NUM_CORE, y: coreAvgY / NUM_CORE },
    sparkPhase: physicsState.sparkPhase,
  };
}

function getParticlePhysicsState({
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

function isCoreParticle(index: number) {
  return index < NUM_CORE;
}

function isGuardParticle(index: number) {
  return index < NUM_CORE + NUM_GUARD;
}

function updateCoreParticle({
  currentProgress,
  index,
  isTyping,
  physicsState,
  point,
  time,
}: {
  currentProgress: number;
  index: number;
  isTyping: boolean;
  physicsState: ParticlePhysicsState;
  point: Point;
  time: number;
}) {
  const { targetX, targetY } = getCoreTarget({
    index,
    physicsState,
    time,
  });

  point.vx += (targetX - point.x) * 0.01;
  point.vy += (targetY - point.y) * 0.01;

  addCoreParticleJitter({
    currentProgress,
    isTyping,
    physicsState,
    point,
  });
  applyFrictionAndMove(point, 0.92);
}

function getCoreTarget({
  index,
  physicsState,
  time,
}: {
  index: number;
  physicsState: ParticlePhysicsState;
  time: number;
}) {
  const spreadX = physicsState.centerX * 0.65;
  const spreadY = physicsState.centerY * 0.65;
  const cornerX = physicsState.centerX + (index % 2 === 0 ? -spreadX : spreadX);
  const cornerY =
    physicsState.centerY + (Math.floor(index / 2) === 0 ? -spreadY : spreadY);

  const angle = CORE_ANGLES[index] + Math.sin(time * 0.6 + index * 2.1) * 0.2;
  const finalX = physicsState.driftingCenterX + Math.cos(angle) * 27;
  const finalY = physicsState.driftingCenterY + Math.sin(angle) * 27;

  return {
    targetX: cornerX + (finalX - cornerX) * physicsState.easedProgress,
    targetY: cornerY + (finalY - cornerY) * physicsState.easedProgress,
  };
}

function addCoreParticleJitter({
  currentProgress,
  isTyping,
  physicsState,
  point,
}: {
  currentProgress: number;
  isTyping: boolean;
  physicsState: ParticlePhysicsState;
  point: Point;
}) {
  const rnd =
    (isTyping && currentProgress < 0.9 ? 1.5 : 0.2) *
    physicsState.breathStrength;

  point.vx += (Math.random() - 0.5) * 0.1 * rnd;
  point.vy += (Math.random() - 0.5) * 0.1 * rnd;
}

function updateGuardParticle({
  index,
  physicsState,
  point,
  time,
}: {
  index: number;
  physicsState: ParticlePhysicsState;
  point: Point;
  time: number;
}) {
  const { targetX, targetY } = getGuardTarget({
    index,
    physicsState,
    time,
  });

  point.vx += (targetX - point.x) * 0.03;
  point.vy += (targetY - point.y) * 0.03;
  applyFrictionAndMove(point, 0.9);
}

function getGuardTarget({
  index,
  physicsState,
  time,
}: {
  index: number;
  physicsState: ParticlePhysicsState;
  time: number;
}) {
  const breathX = Math.cos(time * 0.8 + index) * 10;
  const breathY = Math.sin(time * 0.6 + index) * 10;
  const guardOffset = GUARD_OFFSETS[index - NUM_CORE];

  return {
    targetX:
      physicsState.driftingCenterX +
      guardOffset.x * physicsState.guardSize +
      breathX,
    targetY:
      physicsState.driftingCenterY +
      guardOffset.y * physicsState.guardSize +
      breathY,
  };
}

function updateAmbientParticle({
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

function applyFrictionAndMove(point: Point, friction: number) {
  point.vx *= friction;
  point.vy *= friction;
  point.x += point.vx;
  point.y += point.vy;
}
