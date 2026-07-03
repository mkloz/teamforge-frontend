import { CORE_ANGLES } from "@/shared/constants/voronoi.constants";
import type { Point } from "../voronoi-contract";
import { applyFrictionAndMove } from "./motion";
import type { ParticlePhysicsState } from "./types";

export function updateCoreParticle({
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
